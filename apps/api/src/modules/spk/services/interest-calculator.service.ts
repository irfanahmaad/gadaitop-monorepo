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

    const startTime = (spk as any).createdAt?.getTime?.() ?? payDate.getTime();
    const daysFromStart = Math.floor(
      (payDate.getTime() - startTime) / (1000 * 60 * 60 * 24),
    );
    const isEarly = daysFromStart < config.earlyPaymentDays;
    const rate = isEarly ? config.earlyInterestRate : config.normalInterestRate;
    const interestAmount = remaining * (rate / 100);
    const adminFeeAmount = principal * (config.adminFeeRate / 100) + config.insuranceFee;
    const isOverdue = payDate > dueDate;
    const latePenalty = isOverdue
      ? this.computeLatePenalty(remaining, dueDate, payDate, config)
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

    const rate = config.normalInterestRate;
    const interestAmount = remaining * (rate / 100);
    const adminFeeAmount =
      remaining * (config.adminFeeRate / 100) + config.insuranceFee;
    const isOverdue = payDate > dueDate;
    const latePenalty = isOverdue
      ? this.computeLatePenalty(remaining, dueDate, payDate, config)
      : 0;
    const totalCharges = interestAmount + adminFeeAmount + latePenalty;
    const principalPaid = Math.max(0, amountPaid - totalCharges);
    const newRemainingBalance = Math.max(0, remaining - principalPaid);
    const newDueDate = new Date(dueDate);
    newDueDate.setDate(newDueDate.getDate() + 30);

    return {
      interestAmount,
      latePenalty,
      principalPaid,
      newRemainingBalance,
      newDueDate,
    };
  }

  /**
   * Compute late penalty with multi-month compounding.
   * Spec: "Keterlambatan > 1 bulan: (d% × n bulan terlambat)"
   */
  private computeLatePenalty(
    remaining: number,
    dueDate: Date,
    payDate: Date,
    config: CompanyInterestConfig,
  ): number {
    const daysLate = Math.floor(
      (payDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysLate <= 0) return 0;
    const monthsLate = Math.max(1, Math.ceil(daysLate / 30));
    return remaining * (config.latePenaltyRate / 100) * monthsLate;
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
    return this.computeLatePenalty(
      remaining,
      dueDate,
      payDate,
      config,
    );
  }
}
