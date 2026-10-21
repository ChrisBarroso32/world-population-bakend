-- CreateTable
CREATE TABLE "countries" (
    "cca3" CHAR(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "capital" VARCHAR(100) NOT NULL,
    "continent" VARCHAR(30) NOT NULL,
    "areaKm2" INTEGER NOT NULL,
    "density" DECIMAL(10,4) NOT NULL,
    "growthRate" DECIMAL(6,4) NOT NULL,
    "worldPercentage" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("cca3")
);

-- CreateTable
CREATE TABLE "population_records" (
    "id" SERIAL NOT NULL,
    "countryCca3" CHAR(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "population" BIGINT NOT NULL,

    CONSTRAINT "population_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "population_records_countryCca3_year_key" ON "population_records"("countryCca3", "year");

-- AddForeignKey
ALTER TABLE "population_records" ADD CONSTRAINT "population_records_countryCca3_fkey" FOREIGN KEY ("countryCca3") REFERENCES "countries"("cca3") ON DELETE CASCADE ON UPDATE CASCADE;
