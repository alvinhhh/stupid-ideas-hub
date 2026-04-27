import { useEffect, useMemo, useRef, useState } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

const HOTDOG_TERMS = ['hot dog', 'hotdog', 'frankfurter', 'sausage', 'bratwurst', 'wiener', 'corn dog', 'dog'];
const FOOD_TERMS = ['sandwich', 'burrito', 'taco', 'roll', 'loaf', 'bagel', 'submarine sandwich', 'meat loaf', 'meatloaf'];

function normalizeLabel(value) {
  return String(value || '').toLowerCase().replaceAll('_', ' ').replaceAll('-', ' ');
}

function formatPercent(value) {
  return (Math.max(0, Math.min(1, value)) * 100).toFixed(1) + '%';
}

function classifyPredictions(predictions) {
  let hotdogScore = 0;
  let foodScore = 0;
  let bestPrediction = predictions[0] || null;

  for (const item of predictions) {
    const label = normalizeLabel(item.className);
    const probability = Number(item.probability || 0);

    if (!bestPrediction || probability > Number(bestPrediction.probability || 0)) {
      bestPrediction = item;
    }

    const hotdogMatch = HOTDOG_TERMS.some((term) => label.includes(term));
    const foodMatch = FOOD_TERMS.some((term) => label.includes(term));

    if (hotdogMatch) {
      hotdogScore += probability * 1.7 + 0.15;
    }

    if (label.includes('dog') && !label.includes('hot dog')) {
      hotdogScore += probability * 0.18;
    }

    if (foodMatch) {
      foodScore += probability * 0.25;
    }
  }

  const verdict = hotdogScore >= Math.max(0.42, foodScore + 0.18) ? 'HOT DOG' : 'NOT HOT DOG';
  const certainty = verdict === 'HOT DOG' ? Math.min(0.98, 0.45 + hotdogScore) : Math.min(0.98, 0.55 - hotdogScore * 0.4 + foodScore * 0.25);

  return {
    verdict,
    certainty,
    bestPrediction,
  };
}

async function analyzePixels(imageEl) {
  const canvas = document.createElement('canvas');
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return {
      verdict: 'NOT HOT DOG',
      certainty: 0.5,
      bestPrediction: null,
      note: 'Fallback scan could not read the image.',
    };
  }

  context.drawImage(imageEl, 0, 0, size, size);
  const data = context.getImageData(0, 0, size, size).data;
  let warmPixels = 0;
  let strongEdgePixels = 0;
  let totalLuma = 0;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luma = (red * 0.299) + (green * 0.587) + (blue * 0.114);
    totalLuma += luma;

    if (red > green && green >= blue) {
      warmPixels += 1;
    }

    if (red > 140 && green > 90 && blue < 120) {
      strongEdgePixels += 1;
    }
  }

  const totalPixels = data.length / 4;
  const warmRatio = warmPixels / totalPixels;
  const spicyRatio = strongEdgePixels / totalPixels;
  const averageLuma = totalLuma / totalPixels;
  const wideBias = imageEl.naturalWidth > imageEl.naturalHeight ? 0.12 : 0;
  const hotdogLikelihood = warmRatio * 0.55 + spicyRatio * 0.9 + wideBias - (averageLuma > 170 ? 0.12 : 0);
  const verdict = hotdogLikelihood > 0.48 ? 'HOT DOG' : 'NOT HOT DOG';
  const certainty = Math.max(0.42, Math.min(0.92, verdict === 'HOT DOG' ? 0.54 + hotdogLikelihood : 0.62 - hotdogLikelihood));

  return {
    verdict,
    certainty,
    bestPrediction: {
      className: verdict === 'HOT DOG' ? 'warm food-like shape' : 'no hot dog signature detected',
      probability: certainty,
    },
    note: 'Fallback scan used color and shape cues.',
  };
}

export default function App() {
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [modelError, setModelError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [verdict, setVerdict] = useState('NOT HOT DOG');
  const [certainty, setCertainty] = useState(0);
  const [status, setStatus] = useState('Upload a photo to start the scan.');
  const [scanning, setScanning] = useState(false);
  const imageRef = useRef(null);
  const objectUrlRef = useRef('');

  useEffect(() => {
    let active = true;

    mobilenet.load({ version: 2, alpha: 1 }).then((loaded) => {
      if (!active) {
        return;
      }
      setModel(loaded);
      setLoadingModel(false);
      setStatus('Model ready. Pick an image and scan it.');
    }).catch(() => {
      if (!active) {
        return;
      }
      setLoadingModel(false);
      setModelError('Model load failed. Fallback scan is ready.');
      setStatus('Fallback scan ready. Pick an image and scan it.');
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const topPredictions = useMemo(() => predictions.slice(0, 5), [predictions]);
  const verdictTone = verdict === 'HOT DOG' ? 'verdict hot' : 'verdict not-hot';

  async function scanImage() {
    const imageEl = imageRef.current;
    if (!imageEl || !imageUrl || !imageLoaded || scanning) {
      return;
    }

    setScanning(true);
    setStatus('Scanning the image now.');

    try {
      if (model) {
        const result = await model.classify(imageEl, 5);
        const summary = classifyPredictions(result);
        setPredictions(result);
        setVerdict(summary.verdict);
        setCertainty(summary.certainty);
        setStatus(summary.bestPrediction ? 'Top label: ' + summary.bestPrediction.className : 'No label returned.');
      } else {
        const fallback = await analyzePixels(imageEl);
        setPredictions(fallback.bestPrediction ? [fallback.bestPrediction] : []);
        setVerdict(fallback.verdict);
        setCertainty(fallback.certainty);
        setStatus(fallback.note || 'Fallback scan finished.');
      }
    } catch {
      const fallback = await analyzePixels(imageEl);
      setPredictions(fallback.bestPrediction ? [fallback.bestPrediction] : []);
      setVerdict(fallback.verdict);
      setCertainty(fallback.certainty);
      setStatus(fallback.note || 'Fallback scan finished.');
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    if (!imageLoaded || !imageUrl) {
      return;
    }

    void scanImage();
  }, [imageLoaded, imageUrl, model]);

  const onPickFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    objectUrlRef.current = URL.createObjectURL(file);
    setImageUrl(objectUrlRef.current);
    setImageLoaded(false);
    setPredictions([]);
    setVerdict('NOT HOT DOG');
    setCertainty(0);
    setStatus('Image loaded. Waiting for the frame to settle.');
  };

  return (
    <main className='shell'>
      <section className='titlebar card stripe-card'>
        <div>
          <p className='eyebrow'>hot dog stand scan</p>
          <h1>Not Hotdog</h1>
          <p className='lede'>Drop in a photo and the classifier checks whether it is hot dog or not hot dog.</p>
        </div>
        <div className='pill-group'>
          <span className={loadingModel ? 'pill pill-warm' : 'pill pill-cool'}>{loadingModel ? 'Loading model' : modelError ? 'Fallback ready' : 'Model ready'}</span>
          <span className='pill pill-invert'>Live verdict</span>
        </div>
      </section>

      <section className='hero card stripe-card'>
        <div className='hero-copy'>
          <p className='eyebrow'>instant judgment</p>
          <div className={'verdict-badge ' + verdictTone}>{verdict}</div>
          <p className='status'>{status}</p>
          <div className='metrics'>
            <div>
              <span>Confidence</span>
              <strong>{formatPercent(certainty)}</strong>
            </div>
            <div>
              <span>Analyzer</span>
              <strong>{model && !modelError ? 'MobileNet' : 'Fallback scan'}</strong>
            </div>
          </div>
          <div className='actions'>
            <label className='file-button'>
              Choose image
              <input type='file' accept='image/*' onChange={onPickFile} />
            </label>
            <button type='button' onClick={() => void scanImage()} disabled={!imageUrl || scanning}>
              {scanning ? 'Scanning' : 'Scan image'}
            </button>
          </div>
        </div>

        <div className='photo-stage'>
          {imageUrl ? (
            <img
              ref={imageRef}
              src={imageUrl}
              alt='Selected upload'
              onLoad={() => {
                setImageLoaded(true);
              }}
            />
          ) : (
            <div className='placeholder'>Choose a photo to begin.</div>
          )}
        </div>
      </section>

      <section className='card predictions-card stripe-card'>
        <div className='section-head'>
          <div>
            <p className='eyebrow'>label stack</p>
            <h2>Top predictions</h2>
          </div>
          <p className='small-copy'>The verdict comes from the best label and the hot dog signal in the score list.</p>
        </div>

        {topPredictions.length === 0 ? (
          <p className='empty-state'>No predictions yet. Upload a photo first.</p>
        ) : (
          <div className='prediction-list'>
            {topPredictions.map((item) => (
              <div key={item.className} className='prediction-row'>
                <span>{item.className}</span>
                <strong>{formatPercent(Number(item.probability || 0))}</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
