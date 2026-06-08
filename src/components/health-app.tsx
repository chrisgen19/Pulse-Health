"use client";

import React, { useState } from "react";
import { HealthProvider, useHealth } from "@/context/HealthContext";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { TrendsView } from "@/components/TrendsView";
import { LoggerModal } from "@/components/LoggerModal";

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "trends">("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"sleep" | "food" | "headache" | "arrhythmia">("sleep");

  const { selectedDate, setSelectedDate } = useHealth();

  const handleOpenModal = (type: "sleep" | "food" | "headache" | "arrhythmia") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onAddClick={() => handleOpenModal("sleep")}
    >
      {/* Date Header: Visible on dashboard page for browsing date timelines */}
      {activeTab === "dashboard" && (
        <Header selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      )}

      {/* Tab Switching Panel */}
      <div className="tab-pane-container">
        {activeTab === "dashboard" ? (
          <div className="fade-in-slide">
            <DashboardView
              onLogSleep={() => handleOpenModal("sleep")}
              onLogFood={() => handleOpenModal("food")}
              onLogHeadache={() => handleOpenModal("headache")}
              onLogArrhythmia={() => handleOpenModal("arrhythmia")}
            />
          </div>
        ) : (
          <div className="fade-in-slide">
            <TrendsView onNavigateToDashboard={() => setActiveTab("dashboard")} />
          </div>
        )}
      </div>

      {/* Unified Input Modal Sheet */}
      <LoggerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalType}
      />

      <style jsx>{`
        .tab-pane-container {
          width: 100%;
        }

        .fade-in-slide {
          animation: fadeSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}

export function HealthApp() {
  return (
    <HealthProvider>
      <MainAppContent />
    </HealthProvider>
  );
}
