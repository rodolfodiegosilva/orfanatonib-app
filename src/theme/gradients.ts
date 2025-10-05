/**
 * Sistema de gradientes centralizado para o projeto Orfanato NIB
 * Baseado nas cores oficiais: Verde (#009933), Amarelo (#FFFF00), Vermelho (#FF0000), Preto (#000000), Branco (#FFFFFF)
 */

export const gradients = {
  // Gradientes principais - combinando com navbar/footer (preto e amarelo)
  primary: {
    // Gradiente principal para headers e elementos importantes
    main: 'linear-gradient(135deg, #000000 0%, #FFFF00 100%)',
    // Variação diagonal
    diagonal: 'linear-gradient(45deg, #000000 30%, #FFFF00 90%)',
    // Variação horizontal
    horizontal: 'linear-gradient(90deg, #000000, #FFFF00)',
    // Variação vertical
    vertical: 'linear-gradient(180deg, #000000, #FFFF00)',
  },

  // Gradientes secundários - usando verde como cor principal
  secondary: {
    // Gradiente verde com amarelo
    main: 'linear-gradient(135deg, #009933 0%, #FFFF00 100%)',
    diagonal: 'linear-gradient(45deg, #009933 30%, #FFFF00 90%)',
    horizontal: 'linear-gradient(90deg, #009933, #FFFF00)',
    vertical: 'linear-gradient(180deg, #009933, #FFFF00)',
  },

  // Gradientes de destaque - usando vermelho
  accent: {
    // Gradiente vermelho com amarelo
    main: 'linear-gradient(135deg, #FF0000 0%, #FFFF00 100%)',
    diagonal: 'linear-gradient(45deg, #FF0000 30%, #FFFF00 90%)',
    horizontal: 'linear-gradient(90deg, #FF0000, #FFFF00)',
    vertical: 'linear-gradient(180deg, #FF0000, #FFFF00)',
  },

  // Gradientes especiais - combinações de 3 cores
  special: {
    // Gradiente completo com todas as cores principais
    full: 'linear-gradient(135deg, #000000 0%, #009933 25%, #FFFF00 50%, #FF0000 75%, #FFFFFF 100%)',
    // Gradiente para banners especiais
    banner: 'linear-gradient(135deg, #000000 0%, #009933 50%, #FFFF00 100%)',
    // Gradiente para CTAs
    cta: 'linear-gradient(45deg, #009933 30%, #FFFF00 70%, #FF0000 100%)',
  },

  // Gradientes sutis - usando branco para suavizar
  subtle: {
    // Gradiente sutil preto para branco
    blackWhite: 'linear-gradient(135deg, #000000 0%, #FFFFFF 100%)',
    // Gradiente sutil verde para branco
    greenWhite: 'linear-gradient(135deg, #009933 0%, #FFFFFF 100%)',
    // Gradiente sutil amarelo para branco
    yellowWhite: 'linear-gradient(135deg, #FFFF00 0%, #FFFFFF 100%)',
    // Gradiente diagonal verde para branco
    greenWhiteDiagonal: 'linear-gradient(45deg, #009933 30%, #FFFFFF 90%)',
    // Gradiente horizontal verde para branco
    greenWhiteHorizontal: 'linear-gradient(90deg, #009933, #FFFFFF)',
  },

  // Gradientes para headers especiais
  header: {
    // Gradiente principal para headers
    main: 'linear-gradient(135deg, #009933 0%, #FFFF00 50%, #009933 100%)',
    // Gradiente diagonal para headers
    diagonal: 'linear-gradient(45deg, #009933 0%, #FFFF00 30%, #009933 70%, #FFFF00 100%)',
    // Gradiente radial para headers
    radial: 'radial-gradient(circle at center, #009933 0%, #FFFF00 50%, #009933 100%)',
    // Gradiente com múltiplas cores
    rainbow: 'linear-gradient(135deg, #009933 0%, #FFFF00 25%, #FF0000 50%, #FFFF00 75%, #009933 100%)',
    // Gradiente verde claro com amarelo dourado
    greenGold: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #f1c40f 100%)',
  },

  // Gradientes para texto
  text: {
    // Para títulos principais
    primary: 'linear-gradient(45deg, #000000 30%, #FFFF00 90%)',
    // Para títulos secundários
    secondary: 'linear-gradient(45deg, #009933 30%, #FFFF00 90%)',
    // Para destaques
    accent: 'linear-gradient(45deg, #FF0000 30%, #FFFF00 90%)',
  },
} as const;

// Função helper para aplicar gradiente com propriedades de texto
export const applyTextGradient = (gradient: string) => ({
  background: gradient,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

// Função helper para aplicar gradiente com sombra
export const applyGradientWithShadow = (gradient: string, shadowColor = 'rgba(0,0,0,0.3)') => ({
  background: gradient,
  boxShadow: `0 4px 8px ${shadowColor}`,
});

// Exportar tipos para TypeScript
export type GradientKey = keyof typeof gradients;
export type GradientVariant = 'main' | 'diagonal' | 'horizontal' | 'vertical';
export type SpecialGradientKey = keyof typeof gradients.special;
export type SubtleGradientKey = keyof typeof gradients.subtle;
export type TextGradientKey = keyof typeof gradients.text;
