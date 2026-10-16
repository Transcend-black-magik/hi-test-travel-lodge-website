import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './style.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/>{import.meta.env.PROD && <SpeedInsights beforeSend={event => { const url = new URL(event.url); url.search = ''; url.hash = ''; return { ...event, url: url.toString() }; }}/>}</React.StrictMode>);
