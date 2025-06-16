
import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
  onClose: () => void;
}

const FileUpload = ({ onFileUpload, onClose }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      let content = '';
      
      if (file.type === 'text/plain') {
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        // For now, we'll show a message about PDF support
        toast({
          title: "PDF Support Coming Soon",
          description: "PDF support is being implemented. Please try with a .txt file for now.",
          variant: "destructive"
        });
        return;
      } else {
        throw new Error('Unsupported file type');
      }
      
      if (content.trim()) {
        onFileUpload(content, file.name);
        toast({
          title: "File Uploaded",
          description: `Successfully uploaded ${file.name}`,
        });
      } else {
        throw new Error('File appears to be empty');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Upload Error",
        description: "Unable to process the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Upload File</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          accept=".txt,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-blue-600" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isProcessing ? 'Processing file...' : 'Drop your file here'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Supports .txt and .pdf files (up to 10MB)
            </p>
            
            <Button
              onClick={() => document.getElementById('fileInput')?.click()}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Note about file processing:</p>
            <p>PDF support is currently being implemented. For now, please use .txt files for the best experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
