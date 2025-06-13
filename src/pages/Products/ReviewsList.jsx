import React from 'react'
import PagesHeader from '../../components/PagesHeader'

export default function ReviewsList() {
  return (
    <div className='flex flex-col h-[150vh]'>
      <PagesHeader
        title="Avis" // or "Utilisateurs"
        breadcrumbs={[
          { label: 'Tableau de bord', link: '/dashboard' }, // "Dashboard" is also often used directly in French
          { label: 'Avis', link: '/dashboard/reviews' }, // or "Utilisateurs"
          { label: 'Liste' }
        ]}
      />

    </div>
  )
}
