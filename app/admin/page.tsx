"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface TokenData {
  token: string;
  timestamp: string;
  userAgent?: string;
}

export default function AdminPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/save-token");
      const data = await response.json();

      if (data.success) {
        setTokens(data.tokens || []);
        setError(null);
      } else {
        setError(data.error || "Không thể tải danh sách token");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    // Tự động refresh mỗi 5 giây
    const interval = setInterval(fetchTokens, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép token vào clipboard!");
  };

  return (
    <main className="p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Quản lý FCM Tokens</h1>
        <Button onClick={fetchTokens} disabled={loading}>
          {loading ? "Đang tải..." : "Làm mới"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && tokens.length === 0 ? (
        <p className="text-gray-600">Đang tải danh sách token...</p>
      ) : tokens.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Chưa có token nào được lưu. Hãy mở ứng dụng trên thiết bị để token được tự động lưu.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            Tổng số token: <strong>{tokens.length}</strong>
          </div>

          <div className="grid gap-4">
            {tokens.map((tokenData, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      Thời gian: {formatDate(tokenData.timestamp)}
                    </div>
                    <div className="font-mono text-sm break-all bg-gray-50 p-2 rounded border">
                      {tokenData.token}
                    </div>
                    {tokenData.userAgent && (
                      <div className="text-xs text-gray-400 mt-2">
                        {tokenData.userAgent}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(tokenData.token)}
                    className="ml-4"
                    size="sm"
                  >
                    Sao chép
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

