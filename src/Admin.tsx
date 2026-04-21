import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Car, Bell, ShieldAlert, Activity, Database, List, Clock, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://carnotify-mini-app-production.up.railway.app';

interface User {
  telegram_id: number;
  first_name: string;
  last_name: string;
  car_number: string;
  created_at: string;
}

interface Notification {
  id: number;
  type: string;
  target_car_number: string;
  sender_name: string;
  sender_car: string;
  reason: string;
  description: string;
  delivered: number;
  created_at: string;
}

interface Report {
  id: number;
  target_car_number: string;
  sender_name: string;
  reason: string;
  description: string;
  created_at: string;
}

export default function Admin() {
  const [data, setData] = useState<{users: User[], notifications: Notification[], reports: Report[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'reports' | 'rules'>('users');

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/data`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center font-sans">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Activity size={32} className="text-blue-500" />
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'reports', label: 'Жалобы', icon: ShieldAlert },
    { id: 'rules', label: 'Правила логики', icon: List },
  ] as const;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight flex items-center gap-3">
              <Database className="text-blue-400" /> Dev Console
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-light">Real-time database monitor & admin panel</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 backdrop-blur-md">
              <Users size={18} className="text-blue-400" />
              <div>
                <p className="text-xs text-gray-500 text-left">Всего юзеров</p>
                <p className="text-xl font-semibold text-left">{data?.users.length || 0}</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 backdrop-blur-md">
              <Bell size={18} className="text-purple-400" />
              <div>
                <p className="text-xs text-gray-500 text-left">Уведомлений</p>
                <p className="text-xl font-semibold text-left">{data?.notifications.length || 0}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex mb-8 space-x-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0A0A0C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
        >
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium text-left">Telegram ID</th>
                    <th className="px-6 py-4 font-medium text-left">Имя</th>
                    <th className="px-6 py-4 font-medium text-left">Авто</th>
                    <th className="px-6 py-4 font-medium text-left">Регистрация</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.users.map((u, i) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      key={i} className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-left">{u.telegram_id}</td>
                      <td className="px-6 py-4 text-gray-200 text-left">{[u.first_name, u.last_name].filter(Boolean).join(' ') || 'Без имени'}</td>
                      <td className="px-6 py-4 text-left">
                        {u.car_number 
                          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs tracking-wider"><Car size={12}/>{u.car_number}</span> 
                          : <span className="text-gray-600 text-xs italic">Нет привязанного номера</span>}
                      </td>
                      <td className="px-6 py-4 text-xs flex items-center gap-1.5 justify-start"><Clock size={12} className="text-gray-600"/> {new Date(u.created_at).toLocaleString('ru-RU')}</td>
                    </motion.tr>
                  ))}
                  {data?.users.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Нет пользователей</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium text-left">Тип</th>
                    <th className="px-6 py-4 font-medium text-left">Отправитель</th>
                    <th className="px-6 py-4 font-medium text-left">Цель (Авто)</th>
                    <th className="px-6 py-4 font-medium text-left">Текст / Причина</th>
                    <th className="px-6 py-4 font-medium text-left">Статус</th>
                    <th className="px-6 py-4 font-medium text-left">Время</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.notifications.map((n, i) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      key={i} className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-left">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          n.type === 'cant_leave' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                          n.type === 'blocked' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {n.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex flex-col items-start">
                          <span className="text-gray-300">{n.sender_name || 'Аноним'}</span>
                          <span className="text-xs text-gray-500 font-mono">{n.sender_car || 'Нет авто'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-400 text-left">{n.target_car_number}</td>
                      <td className="px-6 py-4 w-1/3 text-left">
                        <div className="text-xs text-gray-300 line-clamp-2">{[n.reason, n.description].filter(Boolean).join(' • ')}</div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        {n.delivered 
                          ? <div className="flex items-center gap-1.5 text-emerald-400 text-xs justify-start"><CheckCircle size={14}/> Доставлено</div> 
                          : <div className="flex items-center gap-1.5 text-gray-500 text-xs justify-start"><XCircle size={14}/> Не в системе</div>}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap text-left">{new Date(n.created_at).toLocaleString('ru-RU')}</td>
                    </motion.tr>
                  ))}
                  {data?.notifications.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Нет уведомлений</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium text-left">Отправитель</th>
                    <th className="px-6 py-4 font-medium text-left">Цель (Авто)</th>
                    <th className="px-6 py-4 font-medium text-left">Причина</th>
                    <th className="px-6 py-4 font-medium text-left">Время</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.reports.map((r, i) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      key={i} className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300 text-left">{r.sender_name || 'Аноним'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-400 text-left">{r.target_car_number || '-'}</td>
                      <td className="px-6 py-4 w-1/2 text-left">
                        <div className="text-xs text-gray-300">{[r.reason, r.description].filter(Boolean).join(' • ')}</div>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap text-left">{new Date(r.created_at).toLocaleString('ru-RU')}</td>
                    </motion.tr>
                  ))}
                  {data?.reports.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Нет жалоб</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6 text-left">Правила отправки сообщений (Бот)</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Car size={20} /></div>
                    <h3 className="text-lg font-medium text-white text-left">Не могу выехать (cant_leave)</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 font-light leading-relaxed text-left">
                    Требуется: у отправителя должна быть сохранена своя машина в профиле.<br />
                    Действие: ищет владельца авто, которое перекрыло выезд.
                  </p>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left">
                    <p className="text-xs text-emerald-400 mb-1 font-mono">Сообщение ботом:</p>
                    <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                      Парковочный ассистент{"\n\n"}
                      Ваш автомобиль мешает выезду соседу. Пожалуйста, подойдите к машине.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><ShieldAlert size={20} /></div>
                    <h3 className="text-lg font-medium text-white text-left">Я перекрыл (blocked)</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 font-light leading-relaxed text-left">
                    Требуется: у отправителя должна быть сохранена своя машина в профиле.<br />
                    Действие: уведомляет владельца авто, которое перекрыли, передавая номер отправителя.
                  </p>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left">
                    <p className="text-xs text-emerald-400 mb-1 font-mono">Сообщение ботом:</p>
                    <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                      Парковочный ассистент{"\n\n"}
                      Вашу машину перекрыл сосед (госномер: [Номер отправителя]).{"\n"}
                      Он уедет, как только вы с ним свяжетесь или подадите сигнал.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400"><Bell size={20} /></div>
                    <h3 className="text-lg font-medium text-white text-left">Предупреждение (warn)</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 font-light leading-relaxed text-left">
                    Требуется: просто номер цели.<br />
                    Действие: передает свободный текст причины владельцу.
                  </p>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left">
                    <p className="text-xs text-emerald-400 mb-1 font-mono">Сообщение ботом:</p>
                    <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                      Сообщение о вашем автомобиле{"\n\n"}
                      [Выбранные причины + Описание]
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 opacity-80">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-500/20 rounded-lg text-gray-400"><Activity size={20} /></div>
                    <h3 className="text-lg font-medium text-white text-left">Жалоба (report)</h3>
                  </div>
                  <p className="text-sm text-gray-400 font-light leading-relaxed text-left">
                    Действие: Бот ничего не отправляет никому. Данные просто логируются в таблицу reports для разработчика.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
