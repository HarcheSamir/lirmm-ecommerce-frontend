import React from 'react'
import PagesHeader from '../../components/PagesHeader'
export default function AccountCreate() {
  return (
    <div className='flex flex-col h-[150vh]'>
      <PagesHeader
        title="Créer Un Compte" // or "Utilisateurs"
        breadcrumbs={[
          { label: 'Tableau de bord', link: '/dashboard' }, // "Dashboard" is also often used directly in French
          { label: 'Comptes', link: '/dashboard/accounts' }, // or "Utilisateurs"
          { label: 'Créer' }
        ]}
      />

    </div>
  )
}
