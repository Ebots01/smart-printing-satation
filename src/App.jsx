import React, { useState } from 'react';
import PinEntry from './components/PinEntry.jsx';
import PrintPreview from './components/PrintPreview.jsx';
import PrintOptions from './components/PrintOptions.jsx';
import PaymentSection from './components/PaymentSection.jsx';
import './styles/main.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMeta, setFileMeta] = useState({ pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [printOptions, setPrintOptions] = useState({});
  const [pageSequence, setPageSequence] = useState([]);

  const handlePinSubmit = async (pin) => {
    try {
        const response = await fetch(`http://localhost:3000/file/${pin}`);
        if (!response.ok) {
            throw new Error('File not found for the given PIN.');
        }
        const fileData = await response.json();

        // Fetch the actual file blob
        const fileResponse = await fetch(fileData.url);
        const fileBlob = await fileResponse.blob();
        const file = new File([fileBlob], fileData.name, { type: fileData.type });

        // A simple page count for non-PDFs
        let pageCount = 1;
        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const text = new TextDecoder('utf-8').decode(arrayBuffer);
            const matches = text.match(/\/Type\s*\/Page[^s]/g);
            pageCount = matches ? matches.length : 1;
        }

        setSelectedFile(file);
        setFileMeta({ pages: pageCount });
        setCurrentPage(1);
        setPageSequence(Array.from({ length: pageCount }, (_, i) => i + 1));
    } catch (error) {
        console.error('Error fetching file:', error);
        alert(error.message);
    }
  };


  const canPreview = !!selectedFile;

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Print Preview</h1>
      </header>
      <main className="app__content" role="main">
        <div className="app__left">
          <PinEntry onPinSubmit={handlePinSubmit} />
          {canPreview && (
            <PrintPreview
              file={selectedFile}
              printOptions={printOptions}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pageSequence={pageSequence}
              onPageSequenceChange={setPageSequence}
            />
          )}
        </div>
        <aside className="app__right">
          <PrintOptions totalPages={fileMeta.pages} onChange={setPrintOptions} />
          <PaymentSection upiId="merchant@upi" fileInfo={{ pages: fileMeta.pages }} printOptions={printOptions} />
        </aside>
      </main>
      <footer className="app__footer">
        © {new Date().getFullYear()} Print Preview App
      </footer>
    </div>
  );
}

export default App;