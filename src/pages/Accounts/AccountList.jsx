import React from 'react'
import PagesHeader from '../../components/PagesHeader'

export default function AccountList() {
  return (
    <div className='flex flex-col h-[150vh]'>
    <PagesHeader
      title="Rôles & permissions" // or "Utilisateurs"
      breadcrumbs={[
        { label: 'Tableau de bord', link: '/dashboard' }, // "Dashboard" is also often used directly in French
        { label: 'Comptes', link: '/dashboard/accounts' }, // or "Utilisateurs"
        { label: 'Rôles & permissions' }
      ]}
    />

  </div>
  )
}
