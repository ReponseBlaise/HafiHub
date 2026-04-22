-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "eventId" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "amountPaid" REAL,
    "transactionId" INTEGER,
    "bookedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("bookedAt", "eventId", "id", "status", "updatedAt", "userId") SELECT "bookedAt", "eventId", "id", "status", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_eventId_idx" ON "Booking"("eventId");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
CREATE INDEX "Booking_transactionId_idx" ON "Booking"("transactionId");
CREATE UNIQUE INDEX "Booking_eventId_userId_key" ON "Booking"("eventId", "userId");
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "userId" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "amount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("booked", "capacity", "category", "createdAt", "description", "eventDate", "id", "imageUrl", "location", "title", "updatedAt", "userId") SELECT "booked", "capacity", "category", "createdAt", "description", "eventDate", "id", "imageUrl", "location", "title", "updatedAt", "userId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_userId_idx" ON "Event"("userId");
CREATE INDEX "Event_category_idx" ON "Event"("category");
CREATE INDEX "Event_location_idx" ON "Event"("location");
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");
CREATE INDEX "Event_isPaid_idx" ON "Event"("isPaid");
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Transaction_eventId_idx" ON "Transaction"("eventId");
