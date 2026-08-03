use std::{
    env,
    fs,
    io::Write,
    path::{Path, PathBuf},
    process::{Child, ChildStdin, Command, Stdio},
    sync::Mutex,
};

use tauri::{ipc::InvokeBody, ipc::Request, State};

pub struct AlphaExportState(Mutex<Option<AlphaExportSession>>);

impl Default for AlphaExportState {
    fn default() -> Self {
        Self(Mutex::new(None))
    }
}

struct AlphaExportSession {
    child: Child,
    stdin: Option<ChildStdin>,
    frame_bytes: usize,
    output_path: PathBuf,
}

#[tauri::command]
pub fn start_alpha_export(
    output_path: String,
    width: u32,
    height: u32,
    fps: u32,
    state: State<'_, AlphaExportState>,
) -> Result<(), String> {
    validate_settings(width, height, fps)?;
    let output_path = validate_output_path(&output_path)?;
    let ffmpeg = find_ffmpeg().ok_or_else(|| {
        "تصدير Alpha محتاج FFmpeg. ثبّته مرة واحدة بالأمر: brew install ffmpeg".to_string()
    })?;

    let mut active = state.0.lock().map_err(|_| "تعذر بدء تصدير Alpha")?;
    if active.is_some() {
        return Err("في تصدير Alpha شغال بالفعل".into());
    }

    let video_size = format!("{width}x{height}");
    let frame_rate = fps.to_string();
    let mut child = Command::new(ffmpeg)
        .args([
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-f",
            "rawvideo",
            "-pixel_format",
            "rgba",
            "-video_size",
            &video_size,
            "-framerate",
            &frame_rate,
            "-i",
            "pipe:0",
            "-an",
            "-c:v",
            "libvpx-vp9",
            "-pix_fmt",
            "yuva420p",
            "-auto-alt-ref",
            "0",
            "-metadata:s:v:0",
            "alpha_mode=1",
            "-row-mt",
            "1",
            "-deadline",
            "good",
            "-cpu-used",
            "4",
        ])
        .arg(&output_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("مقدرناش نشغّل FFmpeg: {error}"))?;

    let stdin = child.stdin.take().ok_or("مقدرناش نفتح قناة الفيديو")?;
    *active = Some(AlphaExportSession {
        child,
        stdin: Some(stdin),
        frame_bytes: width as usize * height as usize * 4,
        output_path,
    });
    Ok(())
}

#[tauri::command]
pub fn write_alpha_frame(
    request: Request<'_>,
    state: State<'_, AlphaExportState>,
) -> Result<(), String> {
    let bytes = match request.body() {
        InvokeBody::Raw(bytes) => bytes,
        _ => return Err("بيانات فريم Alpha غير صالحة".into()),
    };

    let mut active = state.0.lock().map_err(|_| "تعذر كتابة فريم Alpha")?;
    let session = active.as_mut().ok_or("مفيش تصدير Alpha شغال")?;
    if bytes.len() != session.frame_bytes {
        return Err("حجم فريم Alpha غير صحيح".into());
    }
    session
        .stdin
        .as_mut()
        .ok_or("قناة فيديو Alpha اتقفلت")?
        .write_all(bytes)
        .map_err(|error| format!("تعذر كتابة فريم Alpha: {error}"))
}

#[tauri::command]
pub fn finish_alpha_export(state: State<'_, AlphaExportState>) -> Result<(), String> {
    let mut session = take_session(&state)?;
    drop(session.stdin.take());
    let output = session
        .child
        .wait_with_output()
        .map_err(|error| format!("تعذر إنهاء فيديو Alpha: {error}"))?;
    if output.status.success() {
        return Ok(());
    }

    let _ = fs::remove_file(&session.output_path);
    let details = String::from_utf8_lossy(&output.stderr);
    Err(format!("FFmpeg مقدرش يكوّن فيديو Alpha: {}", details.trim()))
}

#[tauri::command]
pub fn cancel_alpha_export(state: State<'_, AlphaExportState>) -> Result<(), String> {
    let mut session = take_session(&state)?;
    drop(session.stdin.take());
    let _ = session.child.kill();
    let _ = session.child.wait();
    let _ = fs::remove_file(&session.output_path);
    Ok(())
}

fn take_session(state: &State<'_, AlphaExportState>) -> Result<AlphaExportSession, String> {
    state
        .0
        .lock()
        .map_err(|_| "تعذر الوصول لتصدير Alpha")?
        .take()
        .ok_or_else(|| "مفيش تصدير Alpha شغال".into())
}

fn validate_settings(width: u32, height: u32, fps: u32) -> Result<(), String> {
    if ![512, 1024, 2048].contains(&width) || width != height {
        return Err("دقة Alpha غير مدعومة".into());
    }
    if ![24, 30, 60].contains(&fps) {
        return Err("FPS الخاص بـAlpha غير مدعوم".into());
    }
    Ok(())
}

fn validate_output_path(value: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(value);
    if path.extension().and_then(|extension| extension.to_str()) != Some("webm") {
        return Err("ملف Alpha لازم يكون WebM".into());
    }
    let parent = path.parent().ok_or("مسار تصدير Alpha غير صالح")?;
    if !parent.is_dir() {
        return Err("فولدر تصدير Alpha مش موجود".into());
    }
    Ok(path)
}

fn find_ffmpeg() -> Option<PathBuf> {
    let configured = env::var_os("LOOP8_FFMPEG").map(PathBuf::from);
    configured
        .into_iter()
        .chain([
            PathBuf::from("/opt/homebrew/bin/ffmpeg"),
            PathBuf::from("/usr/local/bin/ffmpeg"),
            PathBuf::from("/opt/local/bin/ffmpeg"),
        ])
        .find(|path| Path::new(path).is_file())
}
