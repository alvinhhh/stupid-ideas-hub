import { useEffect, useRef, useState } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

export default function App() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [status, setStatus] = useState('Load an image to classify it.');
  const imageRef = useRef(null);
  const objectUrlRef = useRef('');

  useEffect(() => {
    let active = true;
    mobilenet.load().then((loaded) => {
      if (!active) return;
      setModel(loaded);
      setLoading(false);
      setStatus('Model ready. Upload an image.');
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const classifyImage = async () => {
    if (!model || !imageRef.current) return;
    setStatus('Running the classifier...');
    const result = await model.classify(imageRef.current);
    setPredictions(result);
    setStatus(result[0] ? 'Top prediction: ' + result[0].className : 'No prediction returned.');
  };

  const onPickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setImageUrl(objectUrlRef.current);
    setPredictions([]);
  };

  return (
    <main className='app shell'>
      <section className='hero card'>
        <p className='eyebrow'>not hotdog</p>
        <h1>Upload an image and run it through a pre-trained model.</h1>
        <p className='lede'>This uses MobileNet from TensorFlow.js to surface likely labels and separate hot dog from not hot dog.</p>
        <div className='actions'>
          <label className='file-button'>
            Choose image
            <input type='file' accept='image/*' onChange={onPickFile} />
          </label>
        </div>
        <p className='meta'>{loading ? 'Loading model...' : status}</p>
      </section>

      <section className='card gallery'>
        {imageUrl ? <img ref={imageRef} src={imageUrl} alt='Selected upload' onLoad={classifyImage} /> : <div className='placeholder'>Choose a photo to begin.</div>}
      </section>

      <section className='card output'>
        <h2>Predictions</h2>
        {predictions.length === 0 ? <p className='lede'>No classifications yet.</p> : predictions.map((item) => (
          <div key={item.className} className='prediction-row'>
            <span>{item.className}</span>
            <strong>{(item.probability * 100).toFixed(1)}%</strong>
          </div>
        ))}
      </section>

      <footer className='plain-footer'>
        <a href='https://alvinhua.ng' target='_blank' rel='noreferrer'>alvinhua.ng</a>
      </footer>
    </main>
  );
}
