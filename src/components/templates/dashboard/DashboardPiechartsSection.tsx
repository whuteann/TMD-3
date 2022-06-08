import { useCollection } from '@nandorojo/swr-firestore';
import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import { PROCUREMENTS, PURCHASE_ORDERS, QUOTATIONS, SPARES_PROCUREMENTS, SPARES_PURCHASE_ORDERS } from '../../../constants/Firebase';
import { APPROVED, CONFIRMED, DRAFT, IN_REVIEW, REJECTED } from '../../../types/Common';
import { Procurement } from '../../../types/Procurement';
import { PurchaseOrder } from '../../../types/PurchaseOrder';
import { Quotation } from '../../../types/Quotation';
import { SparesProcurement } from '../../../types/SparesProcurement';
import { SparesPurchaseVoucher } from '../../../types/SparesPurchaseVoucher';
import PieChartSection from './PieChartSection';

const DashboardPiechartsSection: React.FC = ({
}) => {
  const tailwind = useTailwind();

  const { data: quotations } = useCollection<Quotation>(QUOTATIONS, {
    ignoreFirestoreDocumentSnapshotField: false,
  }, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  })

  const { data: procurements } = useCollection<Procurement>(PROCUREMENTS, {
    ignoreFirestoreDocumentSnapshotField: false,
  }, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  })

  const { data: purchaseOrders } = useCollection<PurchaseOrder>(PURCHASE_ORDERS, {
    ignoreFirestoreDocumentSnapshotField: false,
  }, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  })

  const { data: spares_procurements } = useCollection<SparesProcurement>(SPARES_PROCUREMENTS, {
    ignoreFirestoreDocumentSnapshotField: false,
  }, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  })

  const { data: spares_purchaseOrders } = useCollection<SparesPurchaseVoucher>(SPARES_PURCHASE_ORDERS, {
    ignoreFirestoreDocumentSnapshotField: false,
  }, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  })

  let draft: number = 0;
  let rejected: number = 0;
  let inReview: number = 0;
  let approved: number = 0;
  let confirmed: number = 0;

  if (quotations) {
    quotations.map(item => {
      let status = item.status;
      switch (status) {
        case DRAFT:
          draft += 1;
          break;
        case REJECTED:
          rejected += 1;
          break;
        case IN_REVIEW:
          inReview += 1;
          break;
        case APPROVED:
          approved += 1;
          break;
        case CONFIRMED:
          confirmed += 1;
          break;
      }
    })
  }

  return (
    <View>
      <PieChartSection data={[
        { color: "#CBCBCB", quantity: draft, label: DRAFT },
        { color: "#FF0000", quantity: rejected, label: REJECTED },
        { color: "#FBA322", quantity: inReview, label: IN_REVIEW },
        { color: "#EF5713", quantity: approved, label: APPROVED },
        { color: "#71C8B5", quantity: confirmed, label: CONFIRMED }
      ]}
        label="Quotations"
      />
      <PieChartSection data={[
        { color: "#FBA322", quantity: (procurements?.length || 0) + (spares_procurements?.length || 0), label: "Procurements" },
        { color: "#EF5713", quantity: (purchaseOrders?.length || 0) + (spares_purchaseOrders?.length || 0), label: "Purchase Orders" },
      ]}
        label="Procurement"
      />
    </View>
  );
}

export default DashboardPiechartsSection;