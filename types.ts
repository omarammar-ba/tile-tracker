
export interface Reservation {
  id: string;
  customerName: string;
  meters: number;
  notes: string;
  date: string;
}

export interface Tile {
  id: string;
  name: string;
  quality: 'نخب أول' | 'نخب ثاني';
  shade: string;
  size: string; // تم التأكد أنه string وليس قيم محددة
  surface: 'لامع' | 'مطفي';
  boxes: number;
  meters: number;
  pallets: number;
  image: string;
  // الحجوزات المتعددة
  reservations?: Reservation[];
  isReserved?: boolean; 
}

export interface LogEntry {
  id: string;
  timestamp: any;
  user: string;
  action: string;
  tileName: string;
  details: string;
}
