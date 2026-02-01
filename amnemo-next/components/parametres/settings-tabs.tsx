'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordChangeForm } from './password-change-form';
import { FoldersManagement } from './folders-management';
import { TagsManagement } from './tags-management';

interface SettingsTabsProps {
  userRole: 'UTILISATEUR' | 'GESTIONNAIRE' | 'ADMIN';
}

export function SettingsTabs({ userRole }: SettingsTabsProps) {
  const canManage = userRole === 'GESTIONNAIRE' || userRole === 'ADMIN';

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Profil</TabsTrigger>
        {canManage && <TabsTrigger value="folders">Dossiers</TabsTrigger>}
        {canManage && <TabsTrigger value="tags">Tags</TabsTrigger>}
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Modifier le mot de passe</CardTitle>
            <CardDescription>
              Changez votre mot de passe de connexion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </TabsContent>

      {canManage && (
        <TabsContent value="folders">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des dossiers</CardTitle>
              <CardDescription>
                Renommez ou supprimez les dossiers vides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FoldersManagement />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {canManage && (
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des tags</CardTitle>
              <CardDescription>
                Renommez ou supprimez les tags non utilisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TagsManagement />
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
