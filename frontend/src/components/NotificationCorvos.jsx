import React from "react";
import { Bird, Bell, CheckCheck } from "lucide-react";

export const NotificationCorvos = ({ notifications, unreadCount, onMarkRead, onMarkAllRead, show, setShow, containerRef }) => {
    return (
        <div className="relative flex-shrink-0" ref={containerRef}>
            <button
                onClick={() => setShow(!show)}
                className={`relative p-3 rounded-full border transition-all duration-300 btn-press ${show ? "bg-amber-900/30 border-amber-600" : "bg-[#100d0a]/80 border-[#36291d]"}`}
            >
                <Bird size={20} className={unreadCount > 0 ? "text-amber-500" : "text-[#8c7457]"} />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[8px] font-bold text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    </div>
                )}
            </button>

            {show && (
                <div className="absolute right-0 mt-3 w-80 max-h-96 card overflow-hidden z-50 origin-top-right">
                    <div className="metal-edge" />
                    <div className="p-4 border-b border-[#36291d] flex justify-between items-center bg-[#17120e]/55">
                        <h3 className="font-heading font-bold text-[#d4af37] text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <Bell size={14} /> Corvos Mensageiros
                        </h3>
                        {unreadCount > 0 && (
                            <button onClick={onMarkAllRead} className="text-[#786149] hover:text-amber-500">
                                <CheckCheck size={16} />
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1 hide-scrollbar p-3 flex flex-col gap-2">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => !notif.is_read && onMarkRead(notif.id)}
                                    className={`p-3 rounded-lg border transition-all ${notif.is_read ? "opacity-70 border-[#2a2016]" : "bg-gradient-to-r from-[#1c140d] to-[#0c0907] border-amber-900/45 cursor-pointer"}`}
                                >
                                    <h4 className={`font-heading text-[10px] uppercase ${notif.is_read ? "text-[#a68a61]" : "text-amber-400 font-bold"}`}>
                                        {notif.title}
                                    </h4>
                                    <p className="text-[#8c7457] font-body text-[11px] leading-relaxed">{notif.message}</p>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center opacity-55">
                                <Bird size={32} className="mx-auto mb-2" />
                                <p className="text-[10px] uppercase tracking-widest">Nenhuma mensagem.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};