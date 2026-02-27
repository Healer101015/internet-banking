import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

// Importação dos novos componentes
import { BalanceCard } from "../components/BalanceCard";
import { NotificationCorvos } from "../components/NotificationCorvos";
import { GuildSection } from "../components/GuildSection";
import { MissionsSection } from "../components/MissionsSection";
import { TransactionHistory } from "../components/TransactionHistory";
import { ActionButtons } from "../components/ActionButtons";
import { DragonLair } from "../components/DragonLair";
import { DashboardHeader } from "../components/DashboardHeader";

export const Dashboard = () => {
    const { user } = useAuth();
    const notificationsRef = useRef(null);

    // Estados de Dados
    const [balance, setBalance] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [lairBalance, setLairBalance] = useState(0);
    const [missions, setMissions] = useState([]);
    const [guild, setGuild] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de Mecânicas (Taverna)
    const [tributeLoading, setTributeLoading] = useState(false);
    const [earnedAmount, setEarnedAmount] = useState(null);
    const [cooldownMessage, setCooldownMessage] = useState("");

    // Estados de Notificações
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const fetchNotifications = async () => {
        try {
            const notifRes = await api.get("/notifications");
            setNotifications(notifRes.data);
        } catch (error) {
            console.error("Erro ao buscar corvos:", error);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const balanceRes = await api.get("/accounts/balance");
                const myAccountId = balanceRes.data.id;
                setBalance(balanceRes.data.balance_cents / 100);

                const txRes = await api.get("/transactions?limit=3");
                const formattedTx = txRes.data.data.map((tx) => {
                    const isOut = tx.from_account_id === myAccountId;
                    return {
                        id: tx.id,
                        type: isOut ? "OUT" : "IN",
                        amount: tx.amount_cents / 100,
                        name: tx.description || (isOut ? "Moedas Enviadas" : "Moedas Recebidas"),
                        date: new Date(tx.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", ""),
                    };
                });
                setRecentTransactions(formattedTx);

                const rpgRes = await api.get("/dashboard/rpg-data");
                setLairBalance(rpgRes.data.lairBalance / 100);
                setMissions(rpgRes.data.missions);
                setGuild(rpgRes.data.guild);

                fetchNotifications();
            } catch (error) {
                console.error("Erro no reino:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleEarnMoney = async () => {
        setTributeLoading(true);
        setCooldownMessage("");
        try {
            const response = await api.post("/accounts/tribute");
            const ganhoReal = response.data.earned_cents / 100;
            setEarnedAmount(ganhoReal);
            setBalance(response.data.new_balance / 100);

            // Atualiza lista local de transações e notificações
            fetchNotifications();
            setTimeout(() => setEarnedAmount(null), 3000);
        } catch (error) {
            if (error.response?.status === 429) {
                setCooldownMessage(error.response.data.error);
                setTimeout(() => setCooldownMessage(""), 5000);
            }
        } finally {
            setTributeLoading(false);
        }
    };

    // Brasas de fundo (Otimizado com useMemo)
    const embers = useMemo(() => Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 4 + 2}px`,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 8 + 10}s`,
    })), []);

    return (
        <div className="relative w-full min-h-screen bg-[#050403] flex flex-col overflow-x-hidden">
            {/* Efeitos de Fundo */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {embers.map(e => (
                    <div key={e.id} className="absolute bottom-[-20px] bg-[#ff6600] rounded-full animate-emberRise"
                        style={{ left: e.left, width: e.size, height: e.size, animationDelay: e.delay, animationDuration: e.duration }} />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12 pt-6 px-4">
                <DashboardHeader
                    user={user}
                    notificationComponent={
                        <NotificationCorvos
                            notifications={notifications}
                            unreadCount={unreadCount}
                            show={showNotifications}
                            setShow={setShowNotifications}
                            containerRef={notificationsRef}
                        />
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <BalanceCard
                            balance={balance}
                            onEarn={handleEarnMoney}
                            loading={loading}
                            tributeLoading={tributeLoading}
                            earnedAmount={earnedAmount}
                            cooldownMessage={cooldownMessage}
                            formatCurrency={formatCurrency}
                        />
                        <GuildSection guild={guild} />
                        <TransactionHistory transactions={recentTransactions} formatCurrency={formatCurrency} />
                    </div>

                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <ActionButtons />
                        <DragonLair balance={lairBalance} formatCurrency={formatCurrency} />
                        <MissionsSection missions={missions} formatCurrency={formatCurrency} />
                    </div>
                </div>
            </div>
        </div>
    );
};