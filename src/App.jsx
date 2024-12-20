import React, { useState, useEffect } from 'react';

const EarthOrbitAnimation = () => {
  const [day, setDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Constants
  const YEAR_DAYS = 365;
  const ORBITAL_TILT = 23.5; // degrees
  const LAT = 45; // Simulating for 45°N
  
  useEffect(() => {
    let animationFrame;
    
    const animate = () => {
      if (isPlaying) {
        setDay((prevDay) => (prevDay + 0.1) % YEAR_DAYS);
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  // Calculate orbital position
  const getOrbitalPosition = (dayOfYear) => {
    const angle = (dayOfYear / YEAR_DAYS) * 2 * Math.PI;
    // Use slightly elliptical orbit (exaggerated for visualization)
    const a = 160; // semi-major axis
    const e = 0.0167; // Earth's eccentricity
    const r = a * (1 - e * e) / (1 + e * Math.cos(angle));
    return {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
      angle
    };
  };

  // Calculate sun position and day length
  const calculateSunPosition = (dayOfYear) => {
    const angle = (dayOfYear / YEAR_DAYS) * 2 * Math.PI;
    const declination = ORBITAL_TILT * Math.sin(angle - Math.PI/2);
    const latRad = (LAT * Math.PI) / 180;
    const decRad = (declination * Math.PI) / 180;
    const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);
    const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle)));
    const dayLength = (hourAngle * 24) / Math.PI;
    const sunrise = 12 - dayLength/2;
    const sunset = 12 + dayLength/2;
    
    return {
      declination,
      sunrise: sunrise.toFixed(2),
      sunset: sunset.toFixed(2),
      dayLength: dayLength.toFixed(2)
    };
  };

  const position = getOrbitalPosition(day);
  const sunPosition = calculateSunPosition(day);
  const dateString = new Date(2024, 0, 1 + day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Calculate sunrise/sunset angles for the clock visualization
  const sunriseAngle = (parseFloat(sunPosition.sunrise) / 24) * 360;
  const sunsetAngle = (parseFloat(sunPosition.sunset) / 24) * 360;

  // Generate points for the year-long daylight graph
  const generateDaylightPoints = () => {
    const points = [];
    for (let i = 0; i < YEAR_DAYS; i += 5) {
      const dayInfo = calculateSunPosition(i);
      points.push({
        x: (i / YEAR_DAYS) * 600,
        sunrise: 150 - (parseFloat(dayInfo.sunrise) * 10),
        sunset: 150 - (parseFloat(dayInfo.sunset) * 10)
      });
    }
    return points;
  };

  const daylightPoints = generateDaylightPoints();

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-xl font-semibold">{dateString}</div>
        
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* Orbital visualization */}
          <div className="relative w-full md:w-1/2 h-96 border border-gray-200 rounded-lg overflow-hidden bg-gray-900">
            
            {/* Orbit SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="-200 -200 400 400">
              <ellipse
                cx="0"
                cy="0"
                rx="160"
                ry="158"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              
              {/* Season markers */}
              <text x="165" y="0" fill="white" fontSize="12">Perihelion (Jan 3)</text>
              <text x="-165" y="0" fill="white" fontSize="12">Aphelion (Jul 4)</text>
              <text x="0" y="-165" fill="white" fontSize="12">Summer Solstice</text>
              <text x="0" y="165" fill="white" fontSize="12">Winter Solstice</text>
              
              {/* Sun */}
              <circle cx="0" cy="0" r="20" fill="yellow">
                <animate
                  attributeName="r"
                  values="20;22;20"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Earth and its tilt */}
              <g transform={`translate(${position.x},${position.y}) rotate(${ORBITAL_TILT})`}>
                <circle cx="0" cy="0" r="10" fill="#1E88E5" />
                <line
                  x1="0"
                  y1="-15"
                  x2="0"
                  y2="15"
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <path
                  d={`M -10,0 A 10,10 0 0 1 10,0`}
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1"
                />
              </g>
            </svg>
          </div>

          {/* Daily sunlight visualization */}
          <div className="relative w-full md:w-1/2 h-96 border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Year-long daylight graph */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 300">
              {/* Background grid */}
              {Array.from({ length: 13 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line
                    x1={i * 50}
                    y1="0"
                    x2={i * 50}
                    y2="300"
                    stroke="#eee"
                    strokeWidth="1"
                  />
                  <text x={i * 50} y="290" fill="#666" fontSize="10">
                    {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' })}
                  </text>
                </React.Fragment>
              ))}
              {Array.from({ length: 25 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line
                    x1="0"
                    y1={i * 12}
                    x2="600"
                    y2={i * 12}
                    stroke="#eee"
                    strokeWidth="1"
                  />
                  <text x="0" y={i * 12} fill="#666" fontSize="10">
                    {24 - i}:00
                  </text>
                </React.Fragment>
              ))}

              {/* Daylight curves */}
              <path
                d={`M ${daylightPoints.map(p => `${p.x},${p.sunrise}`).join(' L ')}`}
                fill="none"
                stroke="#FFB74D"
                strokeWidth="2"
              />
              <path
                d={`M ${daylightPoints.map(p => `${p.x},${p.sunset}`).join(' L ')}`}
                fill="none"
                stroke="#FF9800"
                strokeWidth="2"
              />

              {/* Current day marker */}
              <line
                x1={(day / YEAR_DAYS) * 600}
                y1="0"
                x2={(day / YEAR_DAYS) * 600}
                y2="300"
                stroke="#2196F3"
                strokeWidth="2"
              />

              {/* Current day times */}
              <circle
                cx={(day / YEAR_DAYS) * 600}
                cy={150 - (parseFloat(sunPosition.sunrise) * 10)}
                r="4"
                fill="#FFB74D"
              />
              <circle
                cx={(day / YEAR_DAYS) * 600}
                cy={150 - (parseFloat(sunPosition.sunset) * 10)}
                r="4"
                fill="#FF9800"
              />
            </svg>
          </div>
        </div>

        {/* Time display */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Sunrise</div>
            <div className="text-lg font-medium">
              {Math.floor(parseFloat(sunPosition.sunrise))}:
              {Math.round((parseFloat(sunPosition.sunrise) % 1) * 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Sunset</div>
            <div className="text-lg font-medium">
              {Math.floor(parseFloat(sunPosition.sunset))}:
              {Math.round((parseFloat(sunPosition.sunset) % 1) * 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Controls */}
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Explanation */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            This visualization shows both Earth's orbital position and the resulting daylight hours at 45°N latitude.
            The right graph shows sunrise (upper curve) and sunset (lower curve) times throughout the year.
          </p>
          <p>
            Notice how:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              The rate of change in daylight hours is fastest near the equinoxes (around March and September)
            </li>
            <li>
              The change slows down near the solstices (June and December)
            </li>
            <li>
              Earth's elliptical orbit causes slight variations in the rate of these changes
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EarthOrbitAnimation;