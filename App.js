import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import ConfettiExplosion from 'react-confetti-explosion';

const ScientificCalculator = () => {
  // State management
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [previousResult, setPreviousResult] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [isRadianMode, setIsRadianMode] = useState(true);
  const [is2ndMode, setIs2ndMode] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Constants
  const PI = Math.PI;
  const E = Math.E;

  // Helper functions
  const clearError = () => setError('');

  const formatDisplay = (num) => {
    if (typeof num === 'string') return num;
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return 'Infinity';
    return Number(num).toPrecision(10).replace(/\.?0+$/, '');
  };

  const checkForConfetti = (num1, num2) => {
    return (num1 === 99 && num2 === 33) || (num1 === 33 && num2 === 99);
  };

  // Calculator operations
  const calculate = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '×': (a, b) => a * b,
    '÷': (a, b) => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    },
    'sin': (x) => isRadianMode ? Math.sin(x) : Math.sin(x * PI / 180),
    'cos': (x) => isRadianMode ? Math.cos(x) : Math.cos(x * PI / 180),
    'tan': (x) => isRadianMode ? Math.tan(x) : Math.tan(x * PI / 180),
    'sinh': (x) => Math.sinh(x),
    'cosh': (x) => Math.cosh(x),
    'tanh': (x) => Math.tanh(x),
    'ln': (x) => {
      if (x <= 0) throw new Error('Invalid input for logarithm');
      return Math.log(x);
    },
    'log': (x) => {
      if (x <= 0) throw new Error('Invalid input for logarithm');
      return Math.log10(x);
    },
    'x²': (x) => Math.pow(x, 2),
    'x³': (x) => Math.pow(x, 3),
    '√': (x) => {
      if (x < 0) throw new Error('Invalid input for square root');
      return Math.sqrt(x);
    },
    '∛': (x) => Math.cbrt(x),
    'x!': (x) => {
      if (x < 0 || !Number.isInteger(x)) throw new Error('Invalid factorial input');
      if (x > 170) throw new Error('Number too large for factorial');
      if (x === 0) return 1;
      let result = 1;
      for (let i = 2; i <= x; i++) result *= i;
      return result;
    }
  };

  // Event handlers
  const handleNumber = (num) => {
    clearError();
    if (isNewNumber) {
      setDisplay(num.toString());
      setIsNewNumber(false);
    } else {
      setDisplay(display + num.toString());
    }
  };

  const handleOperator = (op) => {
    clearError();
    try {
      if (previousResult === null) {
        setPreviousResult(parseFloat(display));
      } else {
        const current = parseFloat(display);
        const result = calculate[currentOperation](previousResult, current);
        setPreviousResult(result);
        setDisplay(formatDisplay(result));
        if (checkForConfetti(previousResult, current)) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
      setCurrentOperation(op);
      setIsNewNumber(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEquals = () => {
    clearError();
    try {
      if (previousResult !== null && currentOperation) {
        const current = parseFloat(display);
        const result = calculate[currentOperation](previousResult, current);
        setDisplay(formatDisplay(result));
        setPreviousResult(null);
        setCurrentOperation(null);
        setIsNewNumber(true);
        if (checkForConfetti(previousResult, current)) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousResult(null);
    setCurrentOperation(null);
    setIsNewNumber(true);
    clearError();
  };

  const handleMemory = (action) => {
    try {
      const current = parseFloat(display);
      switch (action) {
        case 'MC':
          setMemory(0);
          break;
        case 'M+':
          setMemory(memory + current);
          break;
        case 'M-':
          setMemory(memory - current);
          break;
        case 'MR':
          setDisplay(formatDisplay(memory));
          setIsNewNumber(true);
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Invalid memory operation');
    }
  };

  // Effect for keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key;
      
      // Number keys (0-9) and decimal point
      if (/^[0-9.]$/.test(key)) {
        handleNumber(key);
      }
      
      // Operators
      const operatorMap = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷',
      };
      if (key in operatorMap) {
        handleOperator(operatorMap[key]);
      }
      
      // Enter or = for equals
      if (key === 'Enter' || key === '=') {
        handleEquals();
      }
      
      // Escape or Delete for clear
      if (key === 'Escape' || key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousResult, currentOperation]); // Dependencies for the keyboard handler

  // Effect for error auto-clearing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Effect for persisting calculator state
  useEffect(() => {
    // Load saved state on mount
    const savedState = localStorage.getItem('calculatorState');
    if (savedState) {
      try {
        const { memory: savedMemory, isDarkMode: savedDarkMode } = JSON.parse(savedState);
        setMemory(savedMemory);
        setIsDarkMode(savedDarkMode);
      } catch (err) {
        console.error('Error loading calculator state:', err);
      }
    }
  }, []);

  // Save state when memory or dark mode changes
  useEffect(() => {
    try {
      localStorage.setItem('calculatorState', JSON.stringify({
        memory,
        isDarkMode
      }));
    } catch (err) {
      console.error('Error saving calculator state:', err);
    }
  }, [memory, isDarkMode]);

  const getButtonClassName = (type = 'default') => {
    const baseClass = 'p-2 text-center rounded transition-colors';
    const darkModeClass = isDarkMode ? 
      'text-white hover:bg-gray-700' : 
      'hover:bg-gray-200';
    
    switch (type) {
      case 'operator':
        return `${baseClass} ${darkModeClass} bg-gray-200`;
      case 'equals':
        return `${baseClass} bg-blue-500 text-white hover:bg-blue-600`;
      case 'clear':
        return `${baseClass} bg-red-500 text-white hover:bg-red-600`;
      default:
        return `${baseClass} ${darkModeClass}`;
    }
  };

  return (
    <div className={`w-96 p-4 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      {showConfetti && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <ConfettiExplosion />
        </div>
      )}
      {/* Display */}
      <div className="mb-4">
        <div className={`text-right text-3xl font-mono p-2 rounded ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {display}
        </div>
        {error && (
          <div className="flex items-center text-red-500 mt-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Calculator buttons */}
      <div className="grid grid-cols-5 gap-2">
        {/* Memory row */}
        <button onClick={() => handleMemory('MC')} className={getButtonClassName()}>MC</button>
        <button onClick={() => handleMemory('MR')} className={getButtonClassName()}>MR</button>
        <button onClick={() => handleMemory('M+')} className={getButtonClassName()}>M+</button>
        <button onClick={() => handleMemory('M-')} className={getButtonClassName()}>M-</button>
        <button onClick={handleClear} className={getButtonClassName('clear')}>AC</button>

        {/* Scientific functions */}
        <button onClick={() => setIs2ndMode(!is2ndMode)} className={getButtonClassName()}>2nd</button>
        <button onClick={() => handleOperator('x²')} className={getButtonClassName()}>x²</button>
        <button onClick={() => handleOperator('x³')} className={getButtonClassName()}>x³</button>
        <button onClick={() => handleOperator('√')} className={getButtonClassName()}>√</button>
        <button onClick={() => handleOperator('∛')} className={getButtonClassName()}>∛</button>

        {/* Numbers and basic operators */}
        {[7, 8, 9].map(num => (
          <button key={num} onClick={() => handleNumber(num)} className={getButtonClassName()}>
            {num}
          </button>
        ))}
        <button onClick={() => handleOperator('÷')} className={getButtonClassName('operator')}>÷</button>
        <button onClick={() => handleNumber(PI)} className={getButtonClassName()}>π</button>

        {[4, 5, 6].map(num => (
          <button key={num} onClick={() => handleNumber(num)} className={getButtonClassName()}>
            {num}
          </button>
        ))}
        <button onClick={() => handleOperator('×')} className={getButtonClassName('operator')}>×</button>
        <button onClick={() => handleNumber(E)} className={getButtonClassName()}>e</button>

        {[1, 2, 3].map(num => (
          <button key={num} onClick={() => handleNumber(num)} className={getButtonClassName()}>
            {num}
          </button>
        ))}
        <button onClick={() => handleOperator('-')} className={getButtonClassName('operator')}>−</button>
        <button onClick={() => setIsRadianMode(!isRadianMode)} className={getButtonClassName()}>
          {isRadianMode ? 'Rad' : 'Deg'}
        </button>

        <button onClick={() => handleNumber('0')} className={`${getButtonClassName()} col-span-2`}>0</button>
        <button onClick={() => handleNumber('.')} className={getButtonClassName()}>.</button>
        <button onClick={() => handleOperator('+')} className={getButtonClassName('operator')}>+</button>
        <button onClick={handleEquals} className={getButtonClassName('equals')}>=</button>
      </div>

      {/* Theme toggle */}
      <div className="mt-4 text-right">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-sm underline"
        >
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>
    </div>
  );
};

export default ScientificCalculator;