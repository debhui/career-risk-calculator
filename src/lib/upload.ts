export function uploadWithProgress(file: File, url: string, onProgress: (p: number) => void) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = evt => {
      if (evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) resolve(true);
      else reject(new Error("Upload failed"));
    };

    xhr.onerror = () => reject(new Error("Upload error"));
    xhr.send(file);
  });
}
