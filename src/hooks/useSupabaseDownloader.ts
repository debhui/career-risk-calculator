"use client";

import { useState, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase/browser"; // adjust import to your setup

interface DownloadResult {
  isLoadingDownload: boolean;
  errorDownload: string | null;
  downloadFile: (bucket: string, path: string, filename?: string) => Promise<void>;
}

export function useSupabaseDownloader(): DownloadResult {
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [errorDownload, setErrorDownload] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  const downloadFile = useCallback(
    async (bucket: string, path: string, filename?: string) => {
      setIsLoadingDownload(true);
      setErrorDownload(null);

      try {
        const { data, error } = await supabase.storage.from(bucket).download(path);

        if (error) throw error;
        if (!data) throw new Error("No file data received");

        const blobUrl = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename || path.split("/").pop() || "download";
        a.click();
        URL.revokeObjectURL(blobUrl);
      } catch (err: any) {
        setErrorDownload(err.message || "Download failed");
      } finally {
        setIsLoadingDownload(false);
      }
    },
    [supabase]
  );

  return { isLoadingDownload, errorDownload, downloadFile };
}
