import React from 'react'
import PagesHeader from '../../components/PagesHeader'

export default function OrderList() {
  return (
    <div className='flex flex-col h-[150vh]'>
      <PagesHeader
        title="Commandes" // or "Utilisateurs"
        breadcrumbs={[
          { label: 'Tableau de bord', link: '/dashboard' }, // "Dashboard" is also often used directly in French
          { label: 'Catégories', link: '/dashboard/order' }, // or "Utilisateurs"
          { label: 'Liste' }
        ]}
      />

    </div>
  )
}
