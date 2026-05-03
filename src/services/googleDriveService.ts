export interface GdriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export const googleDriveService = {
  listFolders: async (accessToken: string, parentId: string = 'root'): Promise<GdriveFile[]> => {
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&orderBy=name`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch folders');
    }

    const data = await response.json();
    return data.files || [];
  },

  getOrCreateFolder: async (accessToken: string, folderName: string, parentId: string = 'root'): Promise<string> => {
    // 1. Search if folder exists
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id; // Return existing folder ID
    }

    // 2. Create if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      })
    });
    
    if (!createRes.ok) throw new Error('Failed to create folder');
    const createData = await createRes.json();
    return createData.id;
  },

  uploadFile: async (accessToken: string, file: File, parentId: string, onProgress?: (progress: number) => void): Promise<string> => {
    const metadata = {
      name: file.name,
      parents: [parentId]
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const resp = JSON.parse(xhr.responseText);
          resolve(resp.id);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });
  }
};
