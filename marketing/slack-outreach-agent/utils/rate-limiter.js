export class RateLimiter {
  constructor(dailyLimit = 40) {
    this.dailyLimit = dailyLimit;
    this.sentToday = 0;
    this.lastReset = new Date().toDateString();
  }

  canSend() {
    const today = new Date().toDateString();
    if (today !== this.lastReset) {
      this.sentToday = 0;
      this.lastReset = today;
    }
    return this.sentToday < this.dailyLimit;
  }

  recordSend() {
    this.sentToday++;
  }

  getRemaining() {
    return Math.max(0, this.dailyLimit - this.sentToday);
  }
}