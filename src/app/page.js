"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Add event listener to handle theme changes
    const themeSelect = document.querySelector('[data-choose-theme]');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.value);
      });

      // Set initial theme from localStorage or default
      const savedTheme = localStorage.getItem('theme') || '';
      document.documentElement.setAttribute('data-theme', savedTheme);
      themeSelect.value = savedTheme;
    }
  }, []);

  return (
    <div className="min-h-screen bg-base-100">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <div className="mb-8">
              <select className="select select-bordered w-full" data-choose-theme onChange={(e) => {
                const theme = e.target.value;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
              }}>
                <option value="">Default theme</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="cupcake">Cupcake</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="dracula">Dracula</option>
                <option value="forest">Forest</option>
                <option value="synthwave">Synthwave</option>
              </select>
            </div>

            <h1 className="text-5xl font-bold">Hello DaisyUI!</h1>
            <p className="py-6">This is a simple frontend using DaisyUI components to verify the configuration is working properly.</p>
            
            <div className="flex flex-col gap-4 items-center">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-accent">Accent Button</button>
            </div>

            <div className="divider my-8">Card Example</div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title justify-center">DaisyUI Card</h2>
                <p>If you can see this styled card with proper theming, DaisyUI is working correctly!</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-ghost">Cancel</button>
                  <button className="btn btn-primary">Accept</button>
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>DaisyUI is properly configured!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
