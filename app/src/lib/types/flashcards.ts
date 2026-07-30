export type Dificuldade = "dificil" | "medio" | "facil";

export type Deck = {
  id: string;
  nome: string;
  materiaNome: string | null;
  materiaCor: string | null;
  totalCartoes: number;
  paraRevisar: number;
  taxaAcerto: number | null;
};

export type LadoCartao = "front" | "back";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  next_review_at: string;
  difficulty_level: Dificuldade | null;
  acertos: number;
  revisoes: number;
  front_image_url: string | null;
  back_image_url: string | null;
  frontImageSignedUrl: string | null;
  backImageSignedUrl: string | null;
};
