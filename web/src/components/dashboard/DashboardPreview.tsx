'use client';

import React from 'react';
import { DashboardHeader } from './sections/DashboardHeader';
import { DashboardStats } from './sections/DashboardStats';
import { DashboardAssets } from './sections/DashboardAssets';
import { DashboardWallet } from './sections/DashboardWallet';
import { DashboardQuickActions } from './sections/DashboardQuickActions';

/**
 * Preview component for demonstrating the Dashboard with mock data
 * Used for design/development purposes
 */
export function DashboardPreview() {
  const mockAddress = '0x9e42e2bAc542e6b1C1e7C6Ec8d3b3d3d3d3d3d3d';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        address={mockAddress}
        onRefresh={() => console.log('Refreshing...')}
        isLoading={false}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="mb-8">
            <DashboardStats portfolio={null} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Assets */}
            <div className="lg:col-span-2">
              <DashboardAssets portfolio={null} />
            </div>

            {/* Right Column: Wallet Info + Quick Actions */}
            <div className="space-y-6">
              <DashboardWallet
                balance="23.7545"
                chainId={137}
              />
              <DashboardQuickActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
