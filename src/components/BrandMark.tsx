import logoUrl from '../../logo2.png';

export function BrandMark() {
    return (
        <img 
            src={logoUrl} 
            alt="GymPlex Logo" 
            className="h-auto max-h-40 sm:max-h-56 md:max-h-80 w-auto object-contain drop-shadow-2xl" 
        />
    );
}
