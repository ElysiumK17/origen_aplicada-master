/*
  Warnings:

  - Added the required column `state` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "appointment_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "state" TEXT NOT NULL,

    PRIMARY KEY ("appointment_id", "patient_id"),
    CONSTRAINT "Reservation_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("appointment_id", "date", "patient_id") SELECT "appointment_id", "date", "patient_id" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
