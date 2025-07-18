export const imageDownloadPC = (imgSrc: string, fileName: string) => {
  const a = document.createElement('a');
  a.href = imgSrc;

  a.download = fileName;
  a.click();
};

export const imageShare = async (imageUrl: string): Promise<boolean> => {
  if (navigator.share) {
    const blob = await (await fetch(imageUrl)).blob();
    const file = new File([blob], `DNA.png`, {
      type: 'image/png',
    });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: '나만의 커리어 명함',
        text: `Career Evidence Lab | 프로젝트 증거로 발견하는 커리어 패턴`,
        files: [file],
      });

      return true;
    }
  }

  return false;
};
