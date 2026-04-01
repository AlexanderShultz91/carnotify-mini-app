/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  AlertCircle, 
  MessageSquare, 
  Camera, 
  Clock, 
  ChevronDown, 
  X, 
  Check,
  Minus,
  Plus,
  ArrowLeft,
  User,
  CarFront,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CarSideExclamationFill, CarBlocked, TowTruck, Car2Fill, ClockBadgeExclamationFill, Person2Fill } from './SFIcons';
import { MorphingContainer } from './components/MorphingContainer';

type Screen = 'welcome' | 'selection' | 'i-blocked' | 'cant-leave' | 'success' | 'report';

const tg = (window as any).Telegram?.WebApp;

export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    } else if (navigator.vibrate) {
      navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 30);
    }
  },
  notification: (type: 'error' | 'success' | 'warning') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred(type);
    } else if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [10, 30, 20] : type === 'error' ? [20, 20, 20, 20] : [20, 30, 10]);
    }
  },
  selection: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    } else if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  }
};

// --- Components ---

// --- Components ---

const TimeSelector = ({ 
  timeInputMode, 
  setTimeInputMode, 
  leavingIn, 
  setLeavingIn, 
  exactTime, 
  setExactTime,
  theme = 'dark'
}: {
  timeInputMode: 'interval' | 'exact';
  setTimeInputMode: (mode: 'interval' | 'exact') => void;
  leavingIn: number;
  setLeavingIn: (val: number) => void;
  exactTime: string;
  setExactTime: (val: string) => void;
  theme?: 'light' | 'dark';
}) => {
  const isDark = theme === 'dark';
  
  return (
    <div className="w-full">
      {/* Segmented Control */}
      <div className={`p-1 rounded-xl flex mb-6 relative border ${
        isDark ? 'bg-[#1A1A1A] border-gray-800' : 'bg-white/10 border-white/10'
      }`}>
        {/* Active Background Pill */}
        <div className="absolute inset-1 flex pointer-events-none">
          <motion.div 
            layoutId={`activeSegment-${theme}`}
            className={`h-full rounded-lg shadow-sm ${
              isDark ? 'bg-white/10' : 'bg-white'
            }`}
            style={{ 
              width: 'calc(50% - 2px)',
              x: timeInputMode === 'interval' ? 0 : '100%'
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 28, 
              mass: 0.8 
            }}
          />
        </div>

        <button 
          onClick={() => { 
            if (timeInputMode !== 'interval') {
              haptic.selection(); 
              setTimeInputMode('interval'); 
            }
          }}
          className={`flex-1 py-2 text-[11px] font-medium relative z-10 transition-colors duration-200 ${
            timeInputMode === 'interval' 
              ? (isDark ? 'text-white' : 'text-black') 
              : (isDark ? 'text-gray-400' : 'text-white/60')
          }`}
        >
          Через интервал
        </button>
        <button 
          onClick={() => { 
            if (timeInputMode !== 'exact') {
              haptic.selection(); 
              setTimeInputMode('exact'); 
            }
          }}
          className={`flex-1 py-2 text-[11px] font-medium relative z-10 transition-colors duration-200 ${
            timeInputMode === 'exact' 
              ? (isDark ? 'text-white' : 'text-black') 
              : (isDark ? 'text-gray-400' : 'text-white/60')
          }`}
        >
          Точное время
        </button>
      </div>

      <AnimatePresence mode="wait">
        {timeInputMode === 'interval' ? (
          <motion.div
            key="interval"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-5">
              <p className={`${isDark ? 'text-gray-400' : 'text-white/70'} text-[11px] mb-0.5`}>Уеду через</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-white/50'} text-[11px]`}>Предупредите соседа, когда уедете</p>
            </div>
            
            <div className="relative h-20 flex flex-col justify-end mb-6 px-3 touch-none">
              <motion.div 
                className={`absolute top-0 px-2.5 py-1 font-bold rounded-md mb-1 whitespace-nowrap z-30 pointer-events-none text-[10px] ${
                  isDark ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                style={{ 
                  left: `${(leavingIn / 4) * 100}%`,
                  transform: `translateX(-${(leavingIn / 4) * 100}%)`
                }}
                animate={{ 
                  left: `${(leavingIn / 4) * 100}%`,
                  transform: `translateX(-${(leavingIn / 4) * 100}%)`,
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  left: { type: "spring", stiffness: 300, damping: 30 },
                  transform: { type: "spring", stiffness: 300, damping: 30 },
                  scale: { duration: 0.2 }
                }}
              >
                {['5м', '15м', '30м', '1ч', '1.5ч'][leavingIn]}
              </motion.div>

              <div className="relative h-10 flex items-center mb-4">
                {/* Track ticks */}
                <div className="absolute w-full flex justify-between px-0.5 z-0 pointer-events-none">
                  {[0, 1, 2, 3, 4].map((tick) => (
                    <div key={tick} className="flex flex-col items-center">
                      <div className={`w-1 h-1 rounded-full ${
                        leavingIn >= tick 
                          ? (isDark ? 'bg-blue-400' : 'bg-white') 
                          : (isDark ? 'bg-gray-600' : 'bg-white/30')
                      }`} />
                    </div>
                  ))}
                </div>

                <div className={`absolute w-full h-[2px] rounded-full pointer-events-none ${
                  isDark ? 'bg-gray-700' : 'bg-white/20'
                }`}></div>
                <div className={`absolute h-[2px] rounded-full pointer-events-none ${
                  isDark ? 'bg-blue-500' : 'bg-white'
                }`} style={{ width: `${(leavingIn / 4) * 100}%` }}></div>
                
                <motion.div 
                  className="absolute w-5 h-5 bg-white rounded-full shadow-lg pointer-events-none flex items-center justify-center z-10"
                  style={{ left: `calc(${(leavingIn / 4) * 100}% - 10px)` }}
                  animate={{ left: `calc(${(leavingIn / 4) * 100}% - 10px)` }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />

                <input 
                  type="range" 
                  min="0" 
                  max="4" 
                  step="1"
                  value={leavingIn}
                  onPointerDown={() => haptic.impact('light')}
                  onChange={(e) => { 
                    const val = parseInt(e.target.value);
                    if (val !== leavingIn) {
                      haptic.impact('medium');
                      setLeavingIn(val); 
                    }
                  }}
                  className="absolute inset-x-0 -top-4 w-full h-16 opacity-0 cursor-pointer z-50"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="exact"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-5">
              <p className={`${isDark ? 'text-gray-400' : 'text-white/70'} text-[11px] mb-0.5`}>Укажите время</p>
              <p className={`${isDark ? 'text-gray-400' : 'text-white/50'} text-[11px]`}>Выберите точный момент выезда</p>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-2xl border mb-2 ${
              isDark ? 'bg-[#1A1A1A] border-gray-800' : 'bg-white/10 border-white/10'
            }`}>
              <span className={`text-[11px] font-medium ${isDark ? 'text-gray-300' : 'text-white/70'}`}>Время выезда</span>
              <div className="relative">
                <input 
                  type="datetime-local" 
                  value={exactTime}
                  onChange={(e) => { haptic.selection(); setExactTime(e.target.value); }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                  isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white text-black'
                }`}>
                  {new Date(exactTime).toLocaleString('ru-RU', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
            <p className={`text-[9px] text-center ${isDark ? 'text-gray-500' : 'text-white/40'}`}>Нажмите на время, чтобы изменить</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const BackgroundAnimation = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Volumetric light rays */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[300%] h-[300%] top-[-100%] left-[-100%]"
            style={{
              backgroundImage: `linear-gradient(${20 + i * 40}deg, transparent 45%, ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'} 50%, transparent 55%)`,
              filter: 'blur(100px)',
            }}
            animate={{
              y: ['10%', '-10%', '10%'],
              x: ['-5%', '5%', '-5%'],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 25 + i * 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {/* Slow diagonal scan / Breathing light */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(45deg, transparent 0%, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 50%, transparent 100%)`,
          backgroundSize: '200% 200%',
          filter: 'blur(80px)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

const ProfileMenu = ({ cars, onAddCar, onDeleteCar, isDark, isShake, isShine, errorMessage }: { cars: string[], onAddCar: (car: string) => void, onDeleteCar: (car: string) => void, isDark: boolean, isShake: boolean, isShine: boolean, errorMessage: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [tempCarNumber, setTempCarNumber] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const user = tg?.initDataUnsafe?.user;
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const photoUrl = user?.photo_url;
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'П';
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Пользователь';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
        setTempCarNumber('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSave = () => {
    if (tempCarNumber.trim()) {
      haptic.impact('medium');
      onAddCar(tempCarNumber.trim());
      setTempCarNumber('');
      setIsAdding(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2" ref={menuRef}>
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white text-black text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button 
        onClick={() => { haptic.selection(); setIsOpen(!isOpen); setIsAdding(false); setTempCarNumber(''); }}
        className="w-10 h-10 flex flex-col items-center justify-center gap-[4px] active:scale-95 transition-transform"
        animate={isShake ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={isShake ? { duration: 0.4 } : {}}
      >
        <motion.div 
          className={`w-5 h-[2px] rounded-full transition-all duration-300 ${isOpen ? 'bg-[#FF6E40] translate-y-[3px] rotate-45' : (isDark ? 'bg-white' : 'bg-black')}`}
          animate={isShine ? { background: ['#ffffff', '#ff6e40', '#ffffff'] } : {}}
          transition={isShine ? { duration: 1, repeat: Infinity } : {}}
        />
        <motion.div 
          className={`w-5 h-[2px] rounded-full transition-all duration-300 ${isOpen ? 'bg-[#FF6E40] -translate-y-[3px] -rotate-45' : (isDark ? 'bg-white' : 'bg-black')}`}
          animate={isShine ? { background: ['#ffffff', '#ff6e40', '#ffffff'] } : {}}
          transition={isShine ? { duration: 1, repeat: Infinity } : {}}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 right-0 w-56 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-black/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-black/5 flex items-center justify-center shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-black/60 text-[12px] font-medium">{initials}</span>
                )}
              </div>
              <p className="text-black text-[13px] font-medium truncate">{displayName}</p>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {cars.length > 0 && (
                <div className="px-2 py-1.5">
                  {cars.map((car, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-black/5 rounded-lg pl-3 pr-1 py-1 mb-1">
                      <span className="text-black text-[12px] font-medium tracking-widest">{car}</span>
                      <button 
                        onClick={() => { haptic.impact('light'); onDeleteCar(car); }}
                        className="p-1.5 text-black/40 hover:text-red-500 hover:bg-black/5 rounded-md transition-colors active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isAdding ? (
                <div className="px-2 py-1 flex flex-col gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    value={tempCarNumber}
                    onChange={(e) => setTempCarNumber(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="А001АА777"
                    className="w-full bg-black/5 border border-black/5 text-black placeholder-black/30 text-[12px] font-medium py-2 px-3 rounded-xl tracking-widest uppercase focus:outline-none focus:bg-black/10 transition-all"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave}
                      disabled={!tempCarNumber.trim()}
                      className="flex-1 h-8 bg-[#2C2C2E] backdrop-blur-xl border border-white/10 disabled:opacity-30 text-white rounded-lg font-medium text-[11px] transition-all active:scale-95"
                    >
                      Сохранить
                    </button>
                    <button 
                      onClick={() => { setIsAdding(false); setTempCarNumber(''); }}
                      className="px-3 h-8 bg-black/5 backdrop-blur-xl border border-black/5 text-black/60 rounded-lg font-medium text-[11px] transition-all active:scale-95"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => { haptic.selection(); setIsAdding(true); }}
                  className="w-full text-left px-3 py-2 text-[12px] text-blue-600 hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus size={14} />
                  {cars.length > 0 ? 'Добавить авто' : 'Добавить автомобиль'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isShake, setIsShake] = useState(false);
  const [isShine, setIsShine] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [cars, setCars] = useState<string[]>(() => {
    const savedCars = localStorage.getItem('cars');
    if (savedCars) return JSON.parse(savedCars);
    const legacyCar = localStorage.getItem('carNumber');
    if (legacyCar) {
      localStorage.setItem('cars', JSON.stringify([legacyCar]));
      localStorage.removeItem('carNumber');
      return [legacyCar];
    }
    return [];
  });

  // Silent Login
  useEffect(() => {
    const user = tg?.initDataUnsafe?.user;
    if (!user?.id) return;

    const performSilentLogin = async () => {
      try {
        // 1. Check if user exists
        const response = await fetch(`/api/user/${user.id}`);
        
        if (response.status === 404) {
          // 2. Register if not found
          const registerResponse = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegram_id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              car_number: cars.length > 0 ? cars[0] : null // Sync first car if exists
            })
          });
          
          if (registerResponse.ok) {
            console.log('User registered successfully');
          }
        } else if (response.ok) {
          const userData = await response.json();
          // 3. Sync cars from backend if needed
          if (userData.car_number && !cars.includes(userData.car_number)) {
            const updatedCars = [...new Set([...cars, userData.car_number])];
            setCars(updatedCars);
            localStorage.setItem('cars', JSON.stringify(updatedCars));
          }
        }
      } catch (error) {
        console.error('Silent login error:', error);
      }
    };

    performSilentLogin();
  }, []);

  const handleDeleteCar = async (carToDelete: string) => {
    const updatedCars = cars.filter(car => car !== carToDelete);
    setCars(updatedCars);
    localStorage.setItem('cars', JSON.stringify(updatedCars));

    // Sync with backend
    const user = tg?.initDataUnsafe?.user;
    if (user?.id) {
      try {
        await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            car_number: updatedCars.length > 0 ? updatedCars[0] : null
          })
        });
      } catch (error) {
        console.error('Error syncing car deletion:', error);
      }
    }
  };
  const [blockedCarNumbers, setBlockedCarNumbers] = useState<string[]>(['']);
  const [showTime, setShowTime] = useState(false);
  const [timeInputMode, setTimeInputMode] = useState<'interval' | 'exact'>('interval');
  const [leavingIn, setLeavingIn] = useState(2);
  const [exactTime, setExactTime] = useState(new Date().toISOString().slice(0, 16));
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedReportReasons, setSelectedReportReasons] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!tg) return;

    const handleBack = () => {
      haptic.impact('light');
      // Clear state when going back
      setSelectedReasons([]);
      setSelectedReportReasons([]);
      setDescription('');
      setBlockedCarNumbers(['']);

      switch (currentScreen) {
        case 'selection':
        case 'report':
          setCurrentScreen('welcome');
          break;
        case 'warn-owner':
        case 'cant-leave':
        case 'i-blocked':
          setCurrentScreen('selection');
          break;
        case 'success':
          setCurrentScreen('welcome');
          break;
        default:
          setCurrentScreen('welcome');
      }
    };

    if (currentScreen === 'welcome') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }

    tg.BackButton.onClick(handleBack);

    return () => {
      tg.BackButton.offClick(handleBack);
    };
  }, [currentScreen]);

  const handleNotify = async (type: string) => {
    haptic.impact('medium');
    
    // Determine the actual type based on the selected reason if it's from the unified list
    let finalType = type;
    let finalReason = '';
    
    if (type === 'report_screen') {
      const allSelected = [...selectedReasons, ...selectedReportReasons];
      if (allSelected.length === 0) {
        setIsShake(true);
        setIsShine(true);
        setErrorMessage('Выберите причину');
        haptic.notification('error');
        setTimeout(() => {
          setIsShake(false);
          setIsShine(false);
          setErrorMessage('');
        }, 3000);
        return;
      }
      
      finalReason = allSelected.join(', ');
      
      // Logic: if any selected reason is from the "warn" set, it's a warn
      // "Повреждение", "Фары", "Дверь" -> warn
      const warnSet = ["Повреждение / Задели машину", "Горят фары / Опущено стекло", "Открыта дверь"];
      const hasWarn = allSelected.some(r => warnSet.includes(r));
      finalType = hasWarn ? 'warn' : 'report';
    } else {
      finalReason = type === 'warn' ? selectedReasons.join(', ') : (type === 'report' ? selectedReportReasons.join(', ') : null);
    }

    // Validation for blocked, cant_leave, and warn
    if ((finalType === 'blocked' || finalType === 'cant_leave' || finalType === 'warn') && (!blockedCarNumbers[0] || blockedCarNumbers[0].trim() === '')) {
      setIsShake(true);
      setIsShine(true);
      setErrorMessage(finalType === 'warn' ? 'Введите номер автомобиля' : 'Введите сначала номер своего автомобиля');
      haptic.notification('error');
      setTimeout(() => {
        setIsShake(false);
        setIsShine(false);
        setErrorMessage('');
      }, 3000);
      return; // Do not send request
    }

    // Special validation for blocked and cant_leave: user must have their own car linked
    if ((finalType === 'blocked' || finalType === 'cant_leave') && cars.length === 0) {
      setIsShake(true);
      setIsShine(true);
      setErrorMessage('Введите сначала номер своего автомобиля');
      haptic.notification('error');
      setTimeout(() => {
        setIsShake(false);
        setIsShine(false);
        setErrorMessage('');
      }, 3000);
      return; // Do not send request
    }

    // Send request to backend
    const user = tg?.initDataUnsafe?.user;
    if (user?.id) {
      try {
        const response = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: user.id,
            type: finalType,
            target_car_number: (finalType === 'blocked' || finalType === 'cant_leave' || finalType === 'warn') ? blockedCarNumbers[0] : null,
            reason: finalReason,
            description: (finalType === 'warn' || finalType === 'report') ? description : null,
            photo: null // Placeholder for photo handling
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setIsDelivered(data.delivered || false);
          haptic.notification('success');
          setCurrentScreen('success');
          
          // Clear state after success
          setSelectedReasons([]);
          setSelectedReportReasons([]);
          setDescription('');
          setBlockedCarNumbers(['']);
        } else {
          console.error('Notify error:', data.error);
          haptic.notification('error');
        }
      } catch (error) {
        console.error('Error sending notification:', error);
        haptic.notification('error');
      }
    }
  };

  const handleAttachPhoto = () => {
    haptic.impact('medium');
    fileInputRef.current?.click();
  };

  const reasons = [
    "Повреждение / Задели машину",
    "Горят фары / Опущено стекло",
    "Открыта дверь",
    "Эвакуатор!"
  ];

  const reportReasons = [
    "Мешает технике",
    "На тротуаре",
    "Занял 2 места"
  ];

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const toggleReportReason = (reason: string) => {
    if (selectedReportReasons.includes(reason)) {
      setSelectedReportReasons(selectedReportReasons.filter(r => r !== reason));
    } else {
      setSelectedReportReasons([...selectedReportReasons, reason]);
    }
  };

  const screenVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <motion.div 
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center min-h-[100dvh] bg-transparent text-white p-6 relative overflow-hidden z-10"
          >
            <div className="flex-1 flex flex-col items-center justify-center max-w-[280px] mx-auto translate-y-4">
              <h1 className="text-[32px] font-semibold text-center leading-[1.1] mb-1.5 tracking-tight">
                Мешает автомобиль?
              </h1>
              <p className="text-white text-center text-[13px] leading-relaxed font-light opacity-80">
                Свяжись с владельцем<br />или сообщи о проблеме на парковке
              </p>
            </div>
            
            <div className="w-full max-w-[321px] flex flex-row gap-3 mb-40 relative z-20">
              <button 
                onClick={() => { haptic.impact('medium'); setCurrentScreen('selection'); }}
                className="flex-1 h-[35px] bg-[#FF6E40] hover:bg-[#FF8A65] text-white rounded-full font-medium flex items-center justify-center gap-1.5 transition-transform active:scale-95 text-[11px]"
              >
                <MessageSquare size={14} />
                Связаться
              </button>
              <button 
                onClick={() => { haptic.impact('medium'); setCurrentScreen('report'); }}
                className="flex-1 h-[35px] bg-transparent border-[1.5px] border-white hover:border-white text-white rounded-full font-medium flex items-center justify-center gap-1.5 transition-transform active:scale-95 text-[11px]"
                style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
              >
                <AlertCircle size={14} />
                Сообщить
              </button>
            </div>
          </motion.div>
        );

      case 'selection':
        return (
          <motion.div 
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center min-h-[100dvh] bg-transparent text-black p-6 relative overflow-hidden z-10"
          >
            <div className="flex-1 flex flex-col items-center justify-center max-w-[280px] mx-auto translate-y-4">
              <h1 className="text-[32px] font-semibold text-center leading-[1.1] mb-1.5 tracking-tight">
                Что именно<br />случилось?
              </h1>
            </div>
            
            <div className="w-full max-w-[338px] flex flex-col gap-3 mb-40 relative z-20">
              <div className="flex flex-row gap-3">
                <button 
                  onClick={() => { haptic.impact('medium'); setCurrentScreen('cant-leave'); }}
                  className="flex-1 h-[35px] bg-[#FF6E40] hover:bg-[#FF8A65] text-white rounded-full font-medium flex items-center justify-center gap-1.5 transition-transform active:scale-95 text-[11px]"
                >
                  <Car2Fill size={14} />
                  Не могу выехать
                </button>
                <button 
                  onClick={() => { haptic.impact('medium'); setCurrentScreen('i-blocked'); }}
                  className="flex-1 h-[35px] bg-black hover:bg-gray-900 text-white rounded-full font-medium flex items-center justify-center gap-1.5 transition-transform active:scale-95 text-[11px]"
                >
                  <CarSideExclamationFill size={14} />
                  Я перекрыл
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'i-blocked':
        return (
          <motion.div 
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center min-h-[100dvh] bg-transparent text-black p-3 relative overflow-hidden z-10"
          >
            <div className="flex-1 flex flex-col items-start justify-center w-full translate-y-4 px-4">
              <h1 className="text-[28px] font-semibold text-left leading-[1.1] tracking-tight">
                {showTime ? "Со временем – лучше" : <>– Спасибо, что предупредили.<br />(c) Ваш сосед</>}
              </h1>
            </div>
            
            <motion.div 
              animate={isShake ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={isShake ? { duration: 0.4 } : {}}
              className="w-full bg-black text-white rounded-[28px] p-6 shadow-xl shrink-0 mt-auto mb-3 mx-auto relative z-20"
            >
                <div className="mb-4">
                  <h2 className="text-[14px] font-semibold mb-0.5">Я перекрыл</h2>
                  <p className="text-gray-400 text-[11px]">Введите номер автомобиля</p>
                </div>

                <div className="flex flex-col gap-3 mb-5">
                  {blockedCarNumbers.map((num, index) => (
                    <div key={index} className="flex gap-2">
                    <input 
                      type="text" 
                      value={num}
                      onChange={(e) => {
                        const newNumbers = [...blockedCarNumbers];
                        newNumbers[index] = e.target.value;
                        setBlockedCarNumbers(newNumbers);
                      }}
                      placeholder="A001A777"
                      className="flex-1 min-w-0 h-[36px] bg-white text-gray-400 placeholder-gray-400 text-[11px] font-medium px-4 rounded-xl tracking-widest uppercase focus:text-black focus:outline-none"
                    />
                      {index === 0 && (
                        <div className="flex items-center bg-[#1A1A1A] rounded-xl px-1 shrink-0 h-[36px]">
                          <button 
                            onClick={() => {
                              haptic.impact('light');
                              if (blockedCarNumbers.length > 1) {
                                setBlockedCarNumbers(blockedCarNumbers.slice(0, -1));
                              }
                            }} 
                            className={`p-2 ${blockedCarNumbers.length > 1 ? 'text-gray-400 hover:text-white' : 'text-gray-600'}`}
                            disabled={blockedCarNumbers.length <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <div className="w-[1px] h-4 bg-gray-700 mx-0.5"></div>
                          <button 
                            onClick={() => {
                              haptic.impact('light');
                              setBlockedCarNumbers([...blockedCarNumbers, '']);
                            }} 
                            className="p-2 text-gray-400 hover:text-white"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={handleAttachPhoto} className="flex items-center gap-2 text-white mb-6 hover:text-white/80 transition-colors">
                  <div className="border border-white/30 p-1 rounded-lg">
                    <Plus size={12} className="text-white" />
                  </div>
                  <span className="font-medium text-[11px]">Прикрепить фото</span>
                </button>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-white font-semibold">Указать время</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <button 
                    onClick={() => { haptic.impact('light'); setShowTime(!showTime); }}
                    className={`w-10 h-6 rounded-full transition-colors relative ${showTime ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showTime ? 'left-5' : 'left-1'}`}></div>
                  </button>
                </div>

                <AnimatePresence>
                  {showTime && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="mb-6 overflow-hidden px-1"
                    >
                      <TimeSelector 
                        timeInputMode={timeInputMode}
                        setTimeInputMode={setTimeInputMode}
                        leavingIn={leavingIn}
                        setLeavingIn={setLeavingIn}
                        exactTime={exactTime}
                        setExactTime={setExactTime}
                        theme="dark"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={() => handleNotify('blocked')}
                  className="w-full bg-white/15 backdrop-blur-xl border border-white/20 hover:bg-white/25 text-white h-[44px] rounded-full font-semibold text-[13px] transition-all active:scale-[0.98] shadow-sm"
                >
                  Уведомить
                </button>
            </motion.div>
          </motion.div>
        );

      case 'cant-leave':
        return (
          <motion.div 
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center min-h-[100dvh] bg-transparent text-black p-3 relative overflow-hidden z-10"
          >
            <div className="flex-1 flex flex-col items-start justify-center w-full translate-y-4 px-4">
              <h1 className="text-[32px] font-semibold text-left leading-[1.1] mb-1.5 tracking-tight">
                Так-с, так-с<br />сейчас разберемся...)
              </h1>
            </div>

            <motion.div 
              animate={isShake ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={isShake ? { duration: 0.4 } : {}}
              className="w-full bg-[#FF5E2A] text-white rounded-[28px] p-6 shadow-xl shrink-0 mt-auto mb-3 mx-auto"
            >
                <div className="mb-4">
                  <h2 className="text-[16px] font-semibold mb-0.5">Не могу выехать</h2>
                  <p className="text-white/80 text-[11px] font-light">Введите номер автомобиля</p>
                </div>

                <div className="mb-4">
                  <input 
                    type="text" 
                    value={blockedCarNumbers[0]}
                    onChange={(e) => {
                      const newNumbers = [...blockedCarNumbers];
                      newNumbers[0] = e.target.value;
                      setBlockedCarNumbers(newNumbers);
                    }}
                    placeholder="A001A777"
                    className="w-full h-[32px] bg-white text-gray-400 placeholder-gray-400 text-[11px] font-medium px-3 rounded-lg tracking-widest uppercase focus:text-black focus:outline-none"
                  />
                </div>

                <button onClick={handleAttachPhoto} className="flex items-center gap-1.5 text-white mb-5 hover:text-white/80 transition-colors">
                  <div className="bg-white/20 backdrop-blur-xl p-1.5 rounded-lg">
                    <Plus size={12} className="text-white" />
                  </div>
                  <span className="font-medium text-[11px]">Прикрепить фото</span>
                </button>

                <button 
                  onClick={() => handleNotify('cant_leave')}
                  className="w-full bg-white/30 backdrop-blur-xl border border-white/30 hover:bg-white/40 text-black h-[44px] rounded-full font-semibold text-[13px] transition-all active:scale-[0.98] shadow-sm"
                >
                  Уведомить
                </button>
            </motion.div>
          </motion.div>
        );

      case 'warn-owner':
        return (
          <motion.div 
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center min-h-[100dvh] bg-transparent text-black p-3 relative overflow-hidden z-10"
          >
            <div className="flex-1 flex flex-col items-start justify-center w-full translate-y-4 px-4">
              <h1 className="text-[32px] font-semibold text-left leading-[1.1] mb-1.5 tracking-tight">
                {selectedReasons.length > 0 ? <>Спасибо, за вашу<br />внимательность! :)</> : <>О чем хотите<br />предупредить?</>}
              </h1>
            </div>

            <motion.div 
              animate={isShake ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={isShake ? { duration: 0.4 } : {}}
              className="w-full bg-black text-white rounded-[28px] p-6 shadow-xl shrink-0 mt-auto mb-3 mx-auto relative z-20"
            >
                <div className="relative z-10">
                  <div className="mb-6">
                    <h2 className="text-[16px] font-semibold mb-0.5">Увидел и хочу передать</h2>
                    <p className="text-gray-400 text-[11px] font-light mb-4">Введите номер автомобиля</p>

                    <div className="mb-4">
                      <input 
                        type="text" 
                        value={blockedCarNumbers[0]}
                        onChange={(e) => {
                          const newNumbers = [...blockedCarNumbers];
                          newNumbers[0] = e.target.value;
                          setBlockedCarNumbers(newNumbers);
                        }}
                        placeholder="A001A777"
                        className="w-full h-[32px] bg-white text-gray-400 placeholder-gray-400 text-[11px] font-medium px-3 rounded-lg tracking-widest uppercase focus:text-black focus:outline-none"
                      />
                    </div>

                    <p className="text-gray-400 text-[11px] font-light mb-4">Выберите причину</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {reasons.map(reason => {
                        const isSelected = selectedReasons.includes(reason);
                        return (
                          <button
                            key={reason}
                            onClick={() => { haptic.selection(); toggleReason(reason); }}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-white text-black shadow-md' 
                                : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                            }`}
                          >
                            {reason}
                            {isSelected && <Check size={12} className="text-black" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button onClick={handleAttachPhoto} className="flex items-center gap-1.5 text-white mb-5 hover:text-white/80 transition-colors">
                    <div className="bg-white/20 backdrop-blur-xl p-1.5 rounded-lg">
                      <Plus size={12} className="text-white" />
                    </div>
                    <span className="font-medium text-[11px]">Прикрепить фото</span>
                  </button>

                  <button 
                    onClick={() => handleNotify('warn')}
                    className="w-full bg-white/15 backdrop-blur-xl border border-white/20 hover:bg-white/25 text-white h-[44px] rounded-full font-semibold text-[13px] transition-all active:scale-[0.98] shadow-sm"
                  >
                    Уведомить
                  </button>
                </div>
              </motion.div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div 
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center min-h-[100dvh] bg-transparent text-black p-6 relative overflow-hidden z-10"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20"
            >
              <Check size={32} className="text-white" />
            </motion.div>
            <h1 className="text-[32px] font-semibold text-center leading-[1.1] mb-1.5 tracking-tight">
              Успешно!
            </h1>
            <p className="text-gray-500 text-center mb-12 text-[13px] leading-relaxed font-light">
              {isDelivered 
                ? "Уведомление доставлено!" 
                : "Если ваш сосед зарегистрирован в системе, он получит уведомление"}
            </p>
            <button 
              onClick={() => { haptic.impact('light'); setCurrentScreen('welcome'); }}
              className="bg-black text-white h-[32px] px-6 rounded-full font-medium text-[11px] w-full max-w-[260px] transition-transform active:scale-95"
            >
              На главную
            </button>
          </motion.div>
        );

      case 'report':
        return (
          <motion.div 
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center min-h-[100dvh] bg-transparent text-black p-3 relative overflow-hidden z-10"
          >
            <div className="flex-1 flex flex-col items-start justify-center w-full translate-y-4 px-4">
              <h1 className="text-[32px] font-semibold text-left leading-[1.1] mb-1.5 tracking-tight whitespace-nowrap">
                Сообщить о проблеме
              </h1>
            </div>

            <motion.div 
              animate={isShake ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={isShake ? { duration: 0.4 } : {}}
              className="w-full bg-black text-white rounded-[28px] p-6 shadow-xl shrink-0 mt-auto mb-3 mx-auto relative z-20"
            >
                <div className="mb-6">
                  <h2 className="text-[16px] font-medium mb-0.5">Увидел и хочу передать</h2>
                  <p className="text-gray-400 text-[11px] font-light mb-4">Выберите причину</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {[...reasons, ...reportReasons].sort((a, b) => {
                      const aSelected = selectedReasons.includes(a) || selectedReportReasons.includes(a);
                      const bSelected = selectedReasons.includes(b) || selectedReportReasons.includes(b);
                      if (aSelected && !bSelected) return -1;
                      if (!aSelected && bSelected) return 1;
                      return 0;
                    }).map(reason => {
                      const isHelpReason = reasons.includes(reason);
                      const isSelected = isHelpReason 
                        ? selectedReasons.includes(reason) 
                        : selectedReportReasons.includes(reason);
                      
                      return (
                        <button
                          key={reason}
                          onClick={() => { 
                            haptic.selection(); 
                            if (isHelpReason) {
                              toggleReason(reason);
                            } else {
                              toggleReportReason(reason);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-normal transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
                            isSelected 
                              ? 'bg-white text-black shadow-md' 
                              : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                          }`}
                        >
                          {reason === "Эвакуатор!" && (
                            <TowTruck 
                              size={14} 
                              className={isSelected ? "text-black" : "text-white"} 
                            />
                          )}
                          <span className="whitespace-nowrap">{reason}</span>
                          {isSelected && <Check size={12} className="text-black shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button onClick={handleAttachPhoto} className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors">
                    <div className="bg-white/20 backdrop-blur-xl p-1.5 rounded-lg">
                      <Plus size={12} className="text-white" />
                    </div>
                    <span className="font-medium text-[11px]">Прикрепить фото</span>
                  </button>

                  <div className="border-t border-white/10 pt-4">
                    <button 
                      onClick={() => { haptic.impact('light'); setIsDetailsExpanded(!isDetailsExpanded); }}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                      <span className="text-[11px] font-light">Добавить детали</span>
                      <ChevronDown 
                        size={12} 
                        className={`transition-transform duration-300 ${isDetailsExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    <motion.div
                      initial={false}
                      animate={{ height: isDetailsExpanded ? 'auto' : 0, opacity: isDetailsExpanded ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pb-4">
                        <div>
                          <p className="text-gray-400 text-[11px] font-light mb-2">Номер авто, если знаете</p>
                          <input 
                            type="text" 
                            value={blockedCarNumbers[0]}
                            onChange={(e) => {
                              const newNumbers = [...blockedCarNumbers];
                              newNumbers[0] = e.target.value;
                              setBlockedCarNumbers(newNumbers);
                            }}
                            placeholder="A001A777"
                            className="w-full h-[32px] bg-white text-gray-400 placeholder-gray-400 text-[11px] font-medium px-3 rounded-lg tracking-widest uppercase focus:text-black focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-[11px] font-light mb-2">Опишите ситуацию</p>
                          <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#1A1A1A] text-white text-[11px] py-2.5 px-3 rounded-lg resize-none h-20 focus:outline-none focus:ring-1 focus:ring-white/20"
                            placeholder="Что случилось?"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <button 
                    onClick={() => {
                      handleNotify('report_screen');
                    }}
                    className="w-full bg-white/15 border border-white/20 hover:bg-white/25 text-white h-[44px] rounded-full font-medium text-[13px] transition-all active:scale-[0.98] shadow-sm"
                  >
                    Отправить
                  </button>
                </div>
              </motion.div>
          </motion.div>
        );
    }
  };

  const isDarkScreen = currentScreen === 'welcome';
  const showProfile = currentScreen !== 'success';

  return (
    <div className={`tg-container relative ${isDarkScreen ? 'bg-[#0D0D0D]' : 'bg-[#F0F0F0]'} overflow-hidden transition-colors duration-500`}>
      <BackgroundAnimation isDark={isDarkScreen} />
      {showProfile && (
        <ProfileMenu 
          cars={cars} 
          isDark={isDarkScreen}
          isShake={isShake}
          isShine={isShine}
          errorMessage={errorMessage}
          onAddCar={async (newCar) => {
            const updatedCars = [...cars, newCar];
            setCars(updatedCars);
            localStorage.setItem('cars', JSON.stringify(updatedCars));

            // Sync with backend
            const user = tg?.initDataUnsafe?.user;
            if (user?.id) {
              try {
                await fetch('/api/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    telegram_id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    car_number: newCar // Sync the NEW car
                  })
                });
              } catch (error) {
                console.error('Error syncing car addition:', error);
              }
            }
          }} 
          onDeleteCar={handleDeleteCar}
        />
      )}
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>

      {/* Hidden native file input */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            haptic.notification('success');
            // Here you would handle the actual file upload
          }
        }}
      />
    </div>
  );
}
