/*
  Warnings:

  - The primary key for the `AdminUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `admin_id` on the `AdminUser` table. All the data in the column will be lost.
  - The primary key for the `Appointment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointment_id` on the `Appointment` table. All the data in the column will be lost.
  - The primary key for the `Observation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `observation_id` on the `Observation` table. All the data in the column will be lost.
  - The primary key for the `Patients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `patient_id` on the `Patients` table. All the data in the column will be lost.
  - The primary key for the `Professional` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `professional_id` on the `Professional` table. All the data in the column will be lost.
  - The primary key for the `Reservation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TypeConsultation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `type_consultation_id` on the `TypeConsultation` table. All the data in the column will be lost.
  - The primary key for the `TypeIdCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `type_idcard_id` on the `TypeIdCard` table. All the data in the column will be lost.
  - The required column `id` was added to the `AdminUser` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Appointment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Observation` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Patients` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Professional` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `TypeConsultation` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `TypeIdCard` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "registration_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AdminUser" ("name", "password", "registration_date") SELECT "name", "password", "registration_date" FROM "AdminUser";
DROP TABLE "AdminUser";
ALTER TABLE "new_AdminUser" RENAME TO "AdminUser";
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "hour" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    CONSTRAINT "Appointment_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "Professional" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("date", "hour", "patient_id", "professional_id", "state") SELECT "date", "hour", "patient_id", "professional_id", "state" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE TABLE "new_Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    CONSTRAINT "Observation_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "Professional" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Observation_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Observation_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Observation" ("appointment_id", "note", "patient_id", "professional_id") SELECT "appointment_id", "note", "patient_id", "professional_id" FROM "Observation";
DROP TABLE "Observation";
ALTER TABLE "new_Observation" RENAME TO "Observation";
CREATE TABLE "new_Patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photo" TEXT,
    "registration_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Patients" ("photo", "registration_date", "userId") SELECT "photo", "registration_date", "userId" FROM "Patients";
DROP TABLE "Patients";
ALTER TABLE "new_Patients" RENAME TO "Patients";
CREATE UNIQUE INDEX "Patients_userId_key" ON "Patients"("userId");
CREATE TABLE "new_Professional" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "specialty" TEXT NOT NULL,
    "photo" TEXT,
    "registration_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Professional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Professional" ("photo", "registration_date", "specialty", "userId") SELECT "photo", "registration_date", "specialty", "userId" FROM "Professional";
DROP TABLE "Professional";
ALTER TABLE "new_Professional" RENAME TO "Professional";
CREATE UNIQUE INDEX "Professional_userId_key" ON "Professional"("userId");
CREATE TABLE "new_Reservation" (
    "appointment_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,

    PRIMARY KEY ("appointment_id", "patient_id"),
    CONSTRAINT "Reservation_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("appointment_id", "date", "patient_id") SELECT "appointment_id", "date", "patient_id" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE TABLE "new_TypeConsultation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    CONSTRAINT "TypeConsultation_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TypeConsultation" ("appointment_id", "description", "type") SELECT "appointment_id", "description", "type" FROM "TypeConsultation";
DROP TABLE "TypeConsultation";
ALTER TABLE "new_TypeConsultation" RENAME TO "TypeConsultation";
CREATE TABLE "new_TypeIdCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "id_number" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TypeIdCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TypeIdCard" ("id_number", "type", "userId") SELECT "id_number", "type", "userId" FROM "TypeIdCard";
DROP TABLE "TypeIdCard";
ALTER TABLE "new_TypeIdCard" RENAME TO "TypeIdCard";
CREATE UNIQUE INDEX "TypeIdCard_userId_key" ON "TypeIdCard"("userId");
CREATE UNIQUE INDEX "TypeIdCard_type_id_number_key" ON "TypeIdCard"("type", "id_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
