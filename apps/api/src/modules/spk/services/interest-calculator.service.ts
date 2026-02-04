import { Injectable } from '@nestjs/common';

export interface CompanyInterestConfig {
  earlyInterestRate: number;
  normalInterestRate: number;
  adminFeeRate: number;
  insuranceFee: number;
  latePenaltyRate: number;
  minPrincipalPayment: number;
  earlyPaymentDays: number;
}

export interface SpkForCalculation {
  principalAmount: number;
  tenor: number;
  interestRate: number;
  adminFee: number;
  totalAmount: number;
  remainingBalance: number;
  dueDate: Date;
}

export interface FullRedemptionResult {
  interestAmount: number;
  latePenalty: number;
  adminFeeAmount: number;
  totalDue: number;
  principalPaid: number;
}

export interface ExtensionResult {
  interestAmount: number;
  latePenalty: number;
  principalPaid: number;
  newRemainingBalance: number;
  newDueDate: Date;
}

/**
 * Calculates interest, late penalty, and totals for SPK full redemption and extension.
 * Uses company config: early interest (< earlyPaymentDays), normal interest, late penalty.
 */
@Injectable()
export class InterestCalculatorService {
  /**
   * Calculate full redemption: interest + late penalty + remaining balance.
   */
  calculateFullRedemption(
    spk: SpkForCalculation,
    paymentDate: Date,
    config: CompanyInterestConfig,
  ): FullRedemptionResult {
    const principal = Number(spk.principalAmount);
    const remaining = Number(spk.remainingBalance);
    const dueDate = new Date(spk.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const payDate = new Date(paymentDate);
    payDate.setHours(0, 0, 0, 0);

    const daysFromStart = Math.floor(
      (payDate.getTime() - (spk as any).createdAt?.getTime?.() ?? payDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isEarly = daysFromStart < config.earlyPaymentDays;
    const rate = isEarly ? config.earlyInterestRate : config.normalInterestRate;
    const interestAmount = (principal * (rate / 100) * daysFromStart) / spk.tenor;
    const adminFeeAmount = principal * (config.adminFeeRate / 100) + config.insuranceFee;
    const isOverdue = payDate > dueDate;
    const latePenalty = isOverdue
      ? remaining * (config.latePenaltyRate / 100)
      : 0;
    const totalDue = remaining + interestAmount + adminFeeAmount + latePenalty;

    return {
      interestAmount,
      latePenalty,
      adminFeeAmount,
      totalDue,
      principalPaid: remaining,
    };
  }

  /**
   * Calculate extension: interest for period + optional late penalty, apply payment to principal/interest.
   */
  calculateExtension(
    spk: SpkForCalculation,
    paymentDate: Date,
    amountPaid: number,
    config: CompanyInterestConfig,
  ): ExtensionResult {
    const remaining = Number(spk.remainingBalance);
    const dueDate = new Date(spk.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const payDate = new Date(paymentDate);
    payDate.setHours(0, 0, 0, 0);

    const daysFromStart = Math.floor(
      (payDate.getTime() - (spk as any).createdAt?.getTime?.() ?? payDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isEarly = daysFromStart < config.earlyPaymentDays;
    const rate = isEarly ? config.earlyInterestRate : config.normalInterestRate;
    const interestAmount = (remaining * (rate / 100) * spk.tenor) / 365;
    const isOverdue = payDate > dueDate;
    const latePenalty = isOverdue ? remaining * (config.latePenaltyRate / 100) : 0;
    const totalInterestAndPenalty = interestAmount + latePenalty;
    const principalPaid = Math.max(0, amountPaid - totalInterestAndPenalty);
    const newRemainingBalance = Math.max(0, remaining - principalPaid);
    const newDueDate = new Date(payDate);
    newDueDate.setDate(newDueDate.getDate() + spk.tenor);

    return {
      interestAmount,
      latePenalty,
      principalPaid,
      newRemainingBalance,
      newDueDate,
    };
  }

  /**
   * Calculate late penalty only (e.g. for display).
   */
  calculateLatePenalty(
    spk: SpkForCalculation,
    paymentDate: Date,
    config: CompanyInterestConfig,
  ): number {
    const remaining = Number(spk.remainingBalance);
    const dueDate = new Date(spk.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const payDate = new Date(paymentDate);
    payDate.setHours(0, 0, 0, 0);
    if (payDate <= dueDate) return 0;
    return remaining * (config.latePenaltyRate / 100);
  }
}
