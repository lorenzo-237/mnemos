-- AlterTable
ALTER TABLE "sites" ADD COLUMN     "description" TEXT,
ADD COLUMN     "folderId" INTEGER,
ADD COLUMN     "iconName" TEXT,
ADD COLUMN     "isObsolete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "obsoleteReason" TEXT;

-- AlterTable
ALTER TABLE "softwares" ADD COLUMN     "description" TEXT,
ADD COLUMN     "iconName" TEXT,
ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "folders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_tags" (
    "siteId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "site_tags_pkey" PRIMARY KEY ("siteId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "folders_name_key" ON "folders"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "sites_folderId_idx" ON "sites"("folderId");

-- CreateIndex
CREATE INDEX "sites_isObsolete_idx" ON "sites"("isObsolete");

-- AddForeignKey
ALTER TABLE "site_tags" ADD CONSTRAINT "site_tags_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_tags" ADD CONSTRAINT "site_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
