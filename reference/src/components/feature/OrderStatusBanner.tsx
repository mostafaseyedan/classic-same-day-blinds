import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface StatusChange {
  orderId: string;
  newStatus: string;
  previousStatus: string;
  changedAt: string;
  seen: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; icon: string; iconColor: string; textColor: string; label: string }> = {
  'Working on Order': {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    icon: 'ri-tools-line',
    iconColor: 'text-sky-600',
    textColor: 'text-sky-800',
    label: 'Working on Order',
  },
  'Fulfilled & Shipped': {
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    icon: 'ri-truck-line',
    iconColor: 'text-teal-600',
    textColor: 'text-teal-800',
    label: 'Shipped',
  },
  'Delivered': {
    bg: 'bg-green-50',
    border: 'border-green-300',
    icon: 'ri-checkbox-circle-fill',
    iconColor: 'text-green-600',
    textColor: 'text-green-800',
    label: 'Delivered',
  },
  'Cancelled': {
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: 'ri-close-circle-line',
    iconColor: 'text-red-600',
    textColor: 'text-red-800',
    label: 'Cancelled',
  },
  'Pending': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    icon: 'ri-time-line',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-800',
    label: 'Pending',
  },
};

function getStatusMessage(status: string, orderId: string): string {
  switch (status) {
    case 'Working on Order':
      return `Your order ${orderId} is now being actively worked on by our team.`;
    case 'Fulfilled & Shipped':
      return `Great news! Your order ${orderId} has been shipped and is on its way.`;
    case 'Delivered':
      return `Your order ${orderId} has been delivered. We hope you love it!`;
    case 'Cancelled':
      return `Your order ${orderId} has been cancelled. Contact us if you have questions.`;
    case 'Pending':
      return `Your order ${orderId} is pending review.`;
    default:
      return `Your order ${orderId} status has been updated to ${status}.`;
  }
}

function loadSeenNotifications(): Set<string> {
  try {
    const stored = localStorage.getItem('order_notification_seen');
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function markNotificationSeen(key: string) {
  try {
    const seen = loadSeenNotifications();
    seen.add(key);
    localStorage.setItem('order_notification_seen', JSON.stringify([...seen]));
  } catch {
    // ignore
  }
}

export default function OrderStatusBanner() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<StatusChange[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const checkForUpdates = useCallback(() => {
    if (!currentUser) return;

    try {
      const orders: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
      const overrides: Record<string, string> = JSON.parse(
        localStorage.getItem('order_status_overrides') ?? '{}'
      );
      const previousStatuses: Record<string, string> = JSON.parse(
        localStorage.getItem('order_previous_statuses') ?? '{}'
      );
      const seen = loadSeenNotifications();

      const userEmail = currentUser.email?.toLowerCase() ?? '';
      const userOrders = orders.filter((o) => {
        const orderEmail = (o.customer?.email ?? o.email ?? '').toLowerCase();
        return userEmail && orderEmail === userEmail;
      });

      const newNotifications: StatusChange[] = [];

      userOrders.forEach((order) => {
        const currentStatus = overrides[order.id] ?? order.status ?? 'Working on Order';
        const prevStatus = previousStatuses[order.id];
        const notifKey = `${order.id}::${currentStatus}`;

        if (prevStatus && prevStatus !== currentStatus && !seen.has(notifKey)) {
          newNotifications.push({
            orderId: order.id,
            newStatus: currentStatus,
            previousStatus: prevStatus,
            changedAt: new Date().toISOString(),
            seen: false,
          });
        }

        // Track current status as "previous" for next check
        previousStatuses[order.id] = currentStatus;
      });

      localStorage.setItem('order_previous_statuses', JSON.stringify(previousStatuses));

      if (newNotifications.length > 0) {
        setNotifications((prev) => {
          const existingKeys = new Set(prev.map((n) => `${n.orderId}::${n.newStatus}`));
          const fresh = newNotifications.filter(
            (n) => !existingKeys.has(`${n.orderId}::${n.newStatus}`)
          );
          return [...fresh, ...prev];
        });
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 8000);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  const handleDismiss = (notifKey: string) => {
    markNotificationSeen(notifKey);
    setDismissed((prev) => new Set([...prev, notifKey]));
  };

  const handleDismissAll = () => {
    notifications.forEach((n) => {
      const key = `${n.orderId}::${n.newStatus}`;
      markNotificationSeen(key);
    });
    setDismissed(new Set(notifications.map((n) => `${n.orderId}::${n.newStatus}`)));
  };

  const visible = notifications.filter(
    (n) => !dismissed.has(`${n.orderId}::${n.newStatus}`)
  );

  if (!currentUser || visible.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex flex-col gap-0 pointer-events-none">
      <div className="pointer-events-auto">
        {/* Multi-notification collapsed view */}
        {visible.length > 1 && (
          <div className="bg-gray-900 text-white px-5 py-2.5 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center bg-emerald-500 rounded-full flex-shrink-0">
                <i className="ri-notification-3-fill text-xs text-white"></i>
              </div>
              <span className="text-sm font-semibold">
                {visible.length} order status updates
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/orders"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 whitespace-nowrap cursor-pointer"
              >
                View All Orders →
              </Link>
              <button
                onClick={handleDismissAll}
                className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Dismiss All
              </button>
            </div>
          </div>
        )}

        {/* Show latest notification in full */}
        {visible.slice(0, 1).map((notif) => {
          const key = `${notif.orderId}::${notif.newStatus}`;
          const style = STATUS_STYLES[notif.newStatus] ?? STATUS_STYLES['Pending'];

          return (
            <div
              key={key}
              className={`${style.bg} border-b-2 ${style.border} px-5 py-3.5 flex items-center justify-between gap-4 shadow-md animate-slide-down`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Animated pulse icon */}
                <div className={`relative w-9 h-9 flex items-center justify-center rounded-full bg-white border-2 ${style.border} flex-shrink-0`}>
                  <i className={`${style.icon} text-base ${style.iconColor}`}></i>
                  <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-ping`}></span>
                  <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white`}></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${style.textColor}`}>
                      Order Update
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-white border ${style.border} ${style.textColor}`}>
                      <i className={style.icon}></i>
                      {style.label}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${style.textColor} opacity-80 truncate`}>
                    {getStatusMessage(notif.newStatus, notif.orderId)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  to="/orders"
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-white border ${style.border} ${style.textColor} hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer`}
                >
                  Track Order
                </Link>
                <button
                  onClick={() => handleDismiss(key)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/60 transition-colors cursor-pointer ${style.textColor} opacity-60 hover:opacity-100`}
                  title="Dismiss"
                >
                  <i className="ri-close-line text-base"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
