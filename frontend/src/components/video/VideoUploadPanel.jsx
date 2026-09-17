import React, { useState, useRef } from 'react';
import { Upload, Film, FileVideo, Play, RefreshCw, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VideoUploadPanel({ onSelectVideo, onStartAnalysis, isProcessing, selectedVideo }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');



  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setError('');
    const validFormats = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm'];
    const maxSize = 500 * 1024 * 1024; // 500 MB

    if (!validFormats.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv|webm)$/i)) {
      setError('Unsupported video format. Please upload MP4, AVI, MOV, or MKV.');
      return;
    }

    if (file.size > maxSize) {
      setError('File size exceeds maximum limit of 500 MB.');
      return;
    }

    const videoObj = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      duration: '03:15',
      resolution: '1920x1080 (60 FPS)',
      url: URL.createObjectURL(file),
      rawFile: file,
    };

    onSelectVideo(videoObj);
  };

  return (
    <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-6 shadow-xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-400" />
            Upload Retail Surveillance Video for AI Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Upload MP4, AVI, MOV, or MKV files (Max 500 MB) for YOLOv8 & ByteTrack multi-person tracking
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/avi,video/quicktime,video/x-matroska,video/webm"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition flex items-center gap-2 shrink-0"
        >
          <Upload className="w-4 h-4 text-blue-400" />
          <span>Browse Video File</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag and Drop Zone */}
      {!selectedVideo ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
            dragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
          }`}
        >
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Drag & Drop Video File Here</div>
            <div className="text-xs text-slate-400 mt-1">or click to browse local files (MP4, AVI, MOV, MKV up to 500 MB)</div>
          </div>
        </div>
      ) : (
        /* Selected File Card & Actions */
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <FileVideo className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedVideo.name}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                  <span>Size: {selectedVideo.size}</span>
                  <span>Duration: {selectedVideo.duration}</span>
                  <span>Resolution: {selectedVideo.resolution}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectVideo(null)}
              disabled={isProcessing}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => onSelectVideo(null)}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-white font-semibold text-xs rounded-xl border border-slate-800 transition"
            >
              Clear
            </button>

            <button
              onClick={onStartAnalysis}
              disabled={isProcessing}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing AI Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span>Start AI Video Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
