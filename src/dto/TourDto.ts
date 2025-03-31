export interface TourDto {
  id: number;
  name: string;
  duration: number;
  price: number;
}

export interface NewTourDto extends TourDto {}
