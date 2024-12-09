-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "phone_number" TEXT,
    "date_of_birth" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    PRIMARY KEY ("userId", "credentialID"),
    CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "admin_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "registration_date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TypeIdCard" (
    "type_idcard_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "id_number" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TypeIdCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patients" (
    "patient_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "photo" TEXT,
    "registration_date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Professional" (
    "professional_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "specialty" TEXT NOT NULL,
    "photo" TEXT,
    "registration_date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Professional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Observation" (
    "observation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "note" TEXT NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    CONSTRAINT "Observation_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "Professional" ("professional_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Observation_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patients" ("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Observation_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment" ("appointment_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TypeConsultation" (
    "type_consultation_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    CONSTRAINT "TypeConsultation_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment" ("appointment_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "appointment_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "hour" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "professional_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    CONSTRAINT "Appointment_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "Professional" ("professional_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patients" ("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "appointment_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,

    PRIMARY KEY ("appointment_id", "patient_id"),
    CONSTRAINT "Reservation_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment" ("appointment_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patients" ("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "TypeIdCard_userId_key" ON "TypeIdCard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TypeIdCard_type_id_number_key" ON "TypeIdCard"("type", "id_number");

-- CreateIndex
CREATE UNIQUE INDEX "Patients_userId_key" ON "Patients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_userId_key" ON "Professional"("userId");
