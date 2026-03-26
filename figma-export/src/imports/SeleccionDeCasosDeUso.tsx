import clsx from "clsx";
import svgPaths from "./svg-xicmpwcuxz";
import imgCheckout from "figma:asset/1ae2d4bded88e316fc86f7ab55cf53ffd90be0c8.png";
import imgFavicon from "figma:asset/0c96ccfbda7bda53f39c1437cf5bb8dbdf5b6a60.png";
import imgRectangle from "figma:asset/93a2b673c1e7fa21a68c0a4396af2f892c21530d.png";
import imgRectangle1 from "figma:asset/f5af32607e8a76ef24d18725db5489f13901fb2d.png";
import img01FrontSmartPro from "figma:asset/1405161784edb821ef9bfe6c40ebfdd48a93dac6.png";
import img3DIlustracionAroMonedas from "figma:asset/1fe6b6434889a249199504900c01f0c0cfcbb006.png";
import imgBilletera21 from "figma:asset/be54efc078a3fa6d1a6323c796cf773f137f06d7.png";
import img3DTcTowerCopy from "figma:asset/17b8079cec61e1dbfac881e0b4f7bf44729eceb9.png";
import imgFactura2 from "figma:asset/7b760399052b4ca0a7e2e0b8b81bd05062bfde11.png";
import img03411 from "figma:asset/c55847b05da06e3275b525ab82c8ff50b474962e.png";
import img3DIlustracionAroMonedas1 from "figma:asset/51ec93439c404eb1e24f5f560c52386d710208c1.png";
type BackgroundImage3Props = {
  additionalClassNames?: string;
};

function BackgroundImage3({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage3Props>) {
  return (
    <div style={{ backgroundImage: "linear-gradient(90deg, rgba(247, 248, 251, 0.2) 0%, rgba(247, 248, 251, 0.2) 100%), linear-gradient(227.684deg, rgba(8, 14, 255, 0.06) 13.583%, rgba(247, 248, 251, 0.02) 50.027%, rgba(8, 14, 255, 0.06) 86.47%)" }} className={clsx("content-stretch flex items-center relative rounded-[100px] shrink-0 size-[48px]", additionalClassNames)}>
      {children}
    </div>
  );
}
type CardBackgroundImageProps = {
  additionalClassNames?: string;
};

function CardBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<CardBackgroundImageProps>) {
  return (
    <div className={clsx("bg-white h-[164px] justify-self-stretch relative rounded-[16px] shrink-0", additionalClassNames)}>
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[16px] relative size-full">{children}</div>
    </div>
  );
}

function BackgroundImage2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        {children}
      </svg>
    </div>
  );
}
type TabActiveBackgroundImageProps = {
  additionalClassNames?: string;
};

function TabActiveBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<TabActiveBackgroundImageProps>) {
  return (
    <div className={clsx("h-[8px] relative w-[6px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 8">
        {children}
      </svg>
    </div>
  );
}
type BackgroundImage1Props = {
  additionalClassNames?: string;
};

function BackgroundImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage1Props>) {
  return (
    <BackgroundImage3>
      <BackgroundImage additionalClassNames="size-[48px]">{children}</BackgroundImage>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_16.1px_0px_rgba(18,30,108,0.15)]" />
    </BackgroundImage3>
  );
}
type BackgroundImageProps = {
  additionalClassNames?: string;
};

function BackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImageProps>) {
  return (
    <div className={clsx("relative rounded-[100px] shrink-0", additionalClassNames)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[100px]">{children}</div>
    </div>
  );
}

function FooterAtomProgressBarBackgroundImage() {
  return (
    <div className="bg-[#f1f2f6] flex-[1_0_0] min-h-px min-w-px relative rounded-[100px]">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center pr-[62px] relative w-full">
          <div className="bg-[#f1f2f6] h-[2px] rounded-[100px] shrink-0 w-full" data-name="Bar indicator" />
        </div>
      </div>
    </div>
  );
}
type TextBackgroundImageProps = {
  text: string;
  text1: string;
};

function TextBackgroundImage({ text, text1 }: TextBackgroundImageProps) {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-full">
      <p className="font-['Montserrat:Semibold',sans-serif] not-italic relative shrink-0 w-full">{text}</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">{text1}</p>
    </div>
  );
}

export default function SeleccionDeCasosDeUso() {
  return (
    <div className="relative size-full" data-name="Selección de casos de uso" style={{ backgroundImage: "linear-gradient(90deg, rgba(247, 248, 251, 0.2) 0%, rgba(247, 248, 251, 0.2) 100%), linear-gradient(121.906deg, rgba(8, 14, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 51.571%, rgba(8, 14, 255, 0.2) 101.2%), linear-gradient(90deg, rgb(247, 248, 251) 0%, rgb(247, 248, 251) 100%)" }}>
      <div className="absolute bottom-[-496px] content-stretch flex flex-col gap-[12px] items-start left-[244px]">
        <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[24px] relative shrink-0 text-[#121e6c] text-[16px] whitespace-nowrap">Novedades</p>
        <div className="bg-white h-[150px] relative rounded-[24px] shrink-0 w-[483px]" data-name="WEB Card / Banner">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[16px] items-center p-[16px] relative size-full">
              <div className="h-full relative rounded-[16px] shrink-0 w-[128px]" data-name="Image" style={{ backgroundImage: "linear-gradient(-90deg, rgb(9, 17, 68) 13.861%, rgb(18, 30, 108) 83.333%)" }}>
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex items-center justify-center p-[12px] relative size-full">
                    <div className="relative rounded-[16px] shrink-0 size-[92px]" data-name="3d/ill3d_checkout_link">
                      <div className="absolute inset-[6.43%]" data-name="checkout">
                        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCheckout} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] h-full items-start justify-center min-h-px min-w-px relative" data-name="Text">
                <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[20px] min-w-full relative shrink-0 text-[#121e6c] text-[14px] w-[min-content]">Tienes $2.000.000 pre-aprobados</p>
                <p className="font-['Montserrat:Regular',sans-serif] font-normal leading-[20px] min-w-full relative shrink-0 text-[#1e1e1e] text-[14px] w-[min-content]">Invierte, gana y crece tu negocio</p>
                <div className="bg-[#121e6c] relative rounded-[32px] shrink-0" data-name="WEB Button">
                  <div className="flex flex-row items-center justify-center size-full">
                    <div className="content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative">
                      <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Button</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-0 top-0 w-[1440px]" data-name="Browser Bar / Desktop">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="bg-[#dee1e6] h-[42px] relative shrink-0 w-full" data-name="Toolbar - Browser Controls">
            <div className="absolute content-stretch flex isolate items-center left-[78px] top-[8px]" data-name="Tabs">
              <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 z-[1]" data-name="End Tab">
                <div className="content-stretch flex items-end justify-center relative shrink-0" data-name="Tab active">
                  <TabActiveBackgroundImage additionalClassNames="shrink-0">
                    <path clipRule="evenodd" d={svgPaths.p2ea0ec00} fill="var(--fill-0, white)" fillRule="evenodd" id="Curve L" />
                  </TabActiveBackgroundImage>
                  <div className="bg-white content-stretch flex gap-[8px] items-center overflow-clip pl-[8px] pr-[4px] py-[8px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0" data-name="Content">
                    <div className="relative shrink-0 size-[16px]" data-name="Favicon">
                      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFavicon} />
                    </div>
                    <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#494c4f] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <p className="leading-[normal]">Bold</p>
                    </div>
                    <div className="relative shrink-0 size-[18px]" data-name="Close">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                        <g id="Close">
                          <path clipRule="evenodd" d={svgPaths.p36a74680} fill="var(--fill-0, #3C4043)" fillRule="evenodd" id="Container" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="-scale-y-100 flex-none rotate-180">
                      <TabActiveBackgroundImage>
                        <path clipRule="evenodd" d={svgPaths.p2ea0ec00} fill="var(--fill-0, white)" fillRule="evenodd" id="Curve R" />
                      </TabActiveBackgroundImage>
                    </div>
                  </div>
                </div>
                <div className="relative shrink-0 size-[20px]" data-name="Plus">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                    <g id="Plus">
                      <path clipRule="evenodd" d={svgPaths.p2320e500} fill="var(--fill-0, #3C4043)" fillRule="evenodd" id="Icon - New Tab" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute h-[12px] left-[13px] top-1/2 w-[52px]" data-name="Browser Controls">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 12">
                <g id="Browser Controls">
                  <circle cx="6" cy="6" fill="var(--fill-0, #FF6058)" id="Option - Close" r="5.75" stroke="var(--stroke-0, #E14942)" strokeWidth="0.5" />
                  <circle cx="26" cy="6" fill="var(--fill-0, #FFC130)" id="Option - Minimize" r="5.75" stroke="var(--stroke-0, #E1A325)" strokeWidth="0.5" />
                  <circle cx="46" cy="6" fill="var(--fill-0, #27CA40)" id="Option - Expand" r="5.75" stroke="var(--stroke-0, #3EAF3F)" strokeWidth="0.5" />
                </g>
              </svg>
            </div>
          </div>
          <div className="bg-white h-[38px] relative shrink-0 w-full" data-name="Toolbar - URL Controls">
            <div aria-hidden="true" className="absolute border-[#dadce0] border-b border-solid inset-0 pointer-events-none" />
            <div className="absolute h-[38px] left-0 right-0 top-0" data-name="Toolbar - URL Controls" />
            <div className="-translate-y-1/2 absolute content-stretch flex items-center right-[14px] top-1/2" data-name="Right Locked Icons">
              <BackgroundImage2>
                <g id="Icon - More">
                  <path clipRule="evenodd" d={svgPaths.p35109ec0} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage2>
            </div>
            <div className="absolute bg-[#f1f3f4] content-stretch flex items-center justify-between left-[134px] px-[10px] py-[6px] right-[43px] rounded-[16px] top-[5px]" data-name="URL">
              <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Left">
                <div className="relative shrink-0 size-[12px]" data-name="Icon - Secure">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                    <g id="Icon - Secure">
                      <path clipRule="evenodd" d={svgPaths.p2503ec80} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                    </g>
                  </svg>
                </div>
                <div className="content-stretch flex font-['Roboto:Regular',sans-serif] font-normal items-center leading-[0] relative shrink-0 text-[14px] tracking-[0.25px] whitespace-nowrap" data-name="Text">
                  <div className="flex flex-col justify-center relative shrink-0 text-[#202124]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal]">bold.co</p>
                  </div>
                  <div className="flex flex-col justify-center relative shrink-0 text-[#696a6c]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal]">/Panel/</p>
                  </div>
                </div>
              </div>
              <BackgroundImage2>
                <g id="Icon - Favorite">
                  <path clipRule="evenodd" d={svgPaths.p127de900} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage2>
            </div>
            <div className="-translate-y-1/2 absolute content-stretch flex gap-[15px] items-start left-[12px] top-1/2" data-name="Left Locked Icons">
              <BackgroundImage2>
                <g id="Back">
                  <path clipRule="evenodd" d={svgPaths.p18d60780} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage2>
              <BackgroundImage2>
                <g id="Forward">
                  <path clipRule="evenodd" d={svgPaths.p245be700} fill="var(--fill-0, #BABCBE)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage2>
              <BackgroundImage2>
                <g id="Refresh">
                  <path clipRule="evenodd" d={svgPaths.p6e12800} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage2>
              <BackgroundImage2>
                <g id="Home">
                  <path d={svgPaths.p38af0f40} fill="var(--fill-0, #5F6368)" id="Container" />
                </g>
              </BackgroundImage2>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[24px] h-[944px] items-center justify-center left-0 top-[80px] w-[1440px]">
        <div className="relative shrink-0 w-full" data-name="Header">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between px-[24px] py-[20px] relative w-full">
              <div className="relative shrink-0 size-[32px]" data-name="Logotype / Bold Isotype">
                <div className="absolute inset-[10%]" data-name="iso">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6 25.6">
                    <path d={svgPaths.p77a8d00} fill="url(#paint0_linear_404_2684)" id="iso" />
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_404_2684" x1="12.6941" x2="12.6941" y1="4.49552e-06" y2="25.6">
                        <stop offset="0.172326" stopColor="#EE424E" />
                        <stop offset="0.833333" stopColor="#121E6C" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Nav">
                <div className="bg-white content-stretch flex gap-[4px] h-[32px] items-center justify-center pl-[12px] pr-[8px] py-[8px] relative rounded-[100px] shadow-[0px_4px_12px_0px_rgba(18,30,108,0.08)] shrink-0" data-name=".atom/header_button">
                  <div className="relative shrink-0" data-name=".atom/tag_label">
                    <div className="content-stretch flex items-start relative">
                      <div className="flex flex-col font-['Montserrat:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#121e6c] text-[14px] text-center whitespace-nowrap">
                        <p className="leading-[20px]">Ayuda</p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-clip relative shrink-0 size-[20px]" data-name="illustration/ill_bolbot">
                    <div className="absolute contents inset-[4.69%_22.88%]" data-name="Group">
                      <div className="absolute contents inset-[4.69%_22.88%]" data-name="Ojos">
                        <div className="absolute contents inset-[4.69%_22.88%]" data-name="Group">
                          <div className="absolute contents inset-[4.69%_22.88%]" data-name="Group">
                            <div className="absolute inset-[4.69%_22.88%]" data-name="Rectangle">
                              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRectangle} />
                              </div>
                            </div>
                          </div>
                          <div className="absolute contents inset-[62.06%_24.77%_8.45%_24.77%]" data-name="Group">
                            <div className="absolute inset-[62.06%_24.77%_8.45%_24.77%] opacity-60" data-name="Rectangle">
                              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRectangle1} />
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-[4.69%_22.9%_4.71%_22.9%] mix-blend-soft-light" data-name="Vector">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8402 18.1201">
                              <path d={svgPaths.p15e44100} fill="url(#paint0_radial_404_2658)" id="Vector" style={{ mixBlendMode: "soft-light" }} />
                              <defs>
                                <radialGradient cx="0" cy="0" gradientTransform="translate(5.42021 9.05996) scale(7.46527)" gradientUnits="userSpaceOnUse" id="paint0_radial_404_2658" r="1">
                                  <stop offset="0.8" stopColor="#EFEFEF" stopOpacity="0" />
                                  <stop offset="0.82" stopColor="#EDEDEF" stopOpacity="0.06" />
                                  <stop offset="0.86" stopColor="#E9EAEF" stopOpacity="0.2" />
                                  <stop offset="0.9" stopColor="#E4E6EF" stopOpacity="0.44" />
                                  <stop offset="0.96" stopColor="#DBDFEF" stopOpacity="0.76" />
                                  <stop offset="1" stopColor="#D6DBF0" />
                                </radialGradient>
                              </defs>
                            </svg>
                          </div>
                          <div className="absolute flex inset-[76.36%_50.55%_5.86%_27.38%] items-center justify-center">
                            <div className="-rotate-60 flex-none h-[39.262px] w-[16.748px]">
                              <div className="relative size-full" data-name="Vector">
                                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.74457 4.08976">
                                  <path d={svgPaths.p3ea674c0} fill="url(#paint0_radial_404_2688)" id="Vector" />
                                  <defs>
                                    <radialGradient cx="0" cy="0" gradientTransform="translate(0.788135 2.02181) rotate(90) scale(2.04618 0.868926)" gradientUnits="userSpaceOnUse" id="paint0_radial_404_2688" r="1">
                                      <stop stopColor="#F0F1F5" stopOpacity="0.7" />
                                      <stop offset="1" stopColor="#F0F1F5" stopOpacity="0" />
                                    </radialGradient>
                                  </defs>
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="absolute inset-[70.89%_35.65%_21.67%_35.65%]" data-name="Group">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.73898 1.48684">
                              <g id="Group">
                                <path d={svgPaths.pc90ad00} fill="var(--fill-0, #0E005A)" id="Vector" />
                                <path d={svgPaths.p2365f600} fill="var(--fill-0, #0E005A)" id="Vector_2" />
                                <path d={svgPaths.pa940280} fill="var(--fill-0, #0E005A)" id="Vector_3" />
                                <path d={svgPaths.p26cf4e00} fill="var(--fill-0, #0E005A)" id="Vector_4" />
                              </g>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative shrink-0 size-[20px]" data-name="icon/ic_close_navigation">
                  <div className="absolute inset-[15.63%_14.06%_15.62%_17.19%]" data-name="Union">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.75 13.75">
                      <path clipRule="evenodd" d={svgPaths.p1c3b0800} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Union" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[48px] items-center justify-center min-h-px min-w-px overflow-clip relative w-[556px]" data-name="Body">
          <div className="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="WEB Panel / Navigation Header">
            <p className="font-['Montserrat:Bold',sans-serif] font-bold h-[20px] leading-[24px] relative shrink-0 text-[#121e6c] text-[20px] w-full">¿Qué quieres hacer con Bold?</p>
            <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1e1e1e] text-[14px] w-full">
              <p className="leading-[20px]">Puedes seleccionar más de una opción.</p>
            </div>
          </div>
          <div className="gap-x-[8px] gap-y-[8px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[___164px_164px_164px] h-[508px] relative shrink-0 w-full" data-name="Grid">
            <CardBackgroundImage additionalClassNames="col-1 row-1">
              <BackgroundImage3 additionalClassNames="justify-center p-[2px]">
                <div className="relative shrink-0 size-[40px]" data-name="01_Front-Smart Pro">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img01FrontSmartPro} />
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_16.1px_0px_rgba(18,30,108,0.15)]" />
              </BackgroundImage3>
              <TextBackgroundImage text="Recibir pagos" text1="Cobra con datáfonos y link de pago." />
            </CardBackgroundImage>
            <CardBackgroundImage additionalClassNames="col-2 row-1">
              <BackgroundImage1>
                <img alt="" className="absolute left-[-1.93%] max-w-none size-[104.01%] top-[-0.18%]" src={img3DIlustracionAroMonedas} />
              </BackgroundImage1>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-full" data-name="Text">
                <div className="font-['Montserrat:Semibold',sans-serif] not-italic relative shrink-0 w-full whitespace-pre-wrap">
                  <p className="mb-0">{`Cobrar con QR `}</p>
                  <p>Bre-B</p>
                </div>
                <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">Recibe al instante desde otros bancos.</p>
              </div>
            </CardBackgroundImage>
            <CardBackgroundImage additionalClassNames="col-3 row-1">
              <BackgroundImage3 additionalClassNames="justify-center">
                <div className="relative rounded-[100px] shrink-0 size-[44px]" data-name="Billetera2 1">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full" src={imgBilletera21} />
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_16.1px_0px_rgba(18,30,108,0.15)]" />
              </BackgroundImage3>
              <TextBackgroundImage text="Manejar mi dinero" text1="Recibe y envía dinero con tu Cuenta Bold." />
            </CardBackgroundImage>
            <CardBackgroundImage additionalClassNames="col-2 row-2">
              <BackgroundImage3 additionalClassNames="justify-center">
                <BackgroundImage additionalClassNames="size-[44px]">
                  <img alt="" className="absolute h-[86.69%] left-[6.82%] max-w-none top-[6.66%] w-[86.36%]" src={img3DTcTowerCopy} />
                </BackgroundImage>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_16.1px_0px_rgba(18,30,108,0.15)]" />
              </BackgroundImage3>
              <TextBackgroundImage text="Recibir préstamos" text1="Con tarjeta de crédito o en tu cuenta." />
            </CardBackgroundImage>
            <CardBackgroundImage additionalClassNames="col-3 row-2">
              <BackgroundImage1>
                <img alt="" className="absolute h-[209.51%] left-[-58.69%] max-w-none top-[-18.93%] w-[208.73%]" src={imgFactura2} />
              </BackgroundImage1>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-full" data-name="Text">
                <p className="font-['Montserrat:Semibold',sans-serif] not-italic relative shrink-0 w-full">{`Emitir facturas `}</p>
                <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">Facturación electrónica desde app o datáfono.</p>
              </div>
            </CardBackgroundImage>
            <CardBackgroundImage additionalClassNames="col-2 row-3">
              <BackgroundImage3 additionalClassNames="justify-center p-[2px]">
                <div className="relative shrink-0 size-[24px]">
                  <div className="absolute inset-[10%]" data-name="iso">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.2 19.2">
                      <path d={svgPaths.p27d43e00} fill={"Gradient" === "White" ? "var(--fill-0, white)" : "Gradient" === "Blue" ? "var(--fill-0, #121E6C)" : "url(#paint0_linear_404_2666)"} id="iso" />
                      {"Gradient" === "Gradient" && (
                        <defs>
                          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_404_2666" x1="9.52059" x2="9.52058" y1="3.37164e-06" y2="19.2">
                            <stop offset="0.172326" stopColor="#EE424E" />
                            <stop offset="0.833333" stopColor="#121E6C" />
                          </linearGradient>
                        </defs>
                      )}
                    </svg>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_16.1px_0px_rgba(18,30,108,0.15)]" />
              </BackgroundImage3>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-full" data-name="Text">
                <div className="font-['Montserrat:Semibold',sans-serif] not-italic relative shrink-0 w-full whitespace-pre-wrap">
                  <p className="mb-0">{`Fallback `}</p>
                  <p>icon</p>
                </div>
                <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">Text</p>
              </div>
            </CardBackgroundImage>
            <CardBackgroundImage additionalClassNames="col-1 row-3">
              <BackgroundImage additionalClassNames="size-[48px]">
                <img alt="" className="absolute h-full left-[-5.79%] max-w-none top-0 w-[149.93%]" src={img03411} />
              </BackgroundImage>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-full" data-name="Text">
                <div className="font-['Montserrat:Semibold',sans-serif] not-italic relative shrink-0 w-full">
                  <p className="mb-0">Gestionar ventas</p>
                  <p>e inventario</p>
                </div>
                <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">Sistema POS en tu negocio.</p>
              </div>
            </CardBackgroundImage>
            <CardBackgroundImage additionalClassNames="col-1 row-2">
              <BackgroundImage1>
                <img alt="" className="absolute left-[-32.79%] max-w-none size-[294.15%] top-[-77.51%]" src={img3DIlustracionAroMonedas1} />
              </BackgroundImage1>
              <TextBackgroundImage text="Generar rentabilidad" text1="Bolsillos al 10% y CDTs al 12% E.A." />
            </CardBackgroundImage>
          </div>
        </div>
        <div className="relative shrink-0 w-full" data-name="Footer">
          <div className="content-stretch flex flex-col gap-[20px] items-start pb-[20px] px-[24px] relative w-full">
            <div className="h-[2px] relative shrink-0 w-full" data-name="Progress / Split bar">
              <div className="content-stretch flex gap-[8px] items-start relative size-full">
                <div className="bg-[#f1f2f6] flex-[1_0_0] min-h-px min-w-px relative rounded-[100px]" data-name=".atom/progress_bar">
                  <div className="flex flex-col justify-center size-full">
                    <div className="content-stretch flex flex-col items-start justify-center pr-[61.98px] relative w-full">
                      <div className="bg-[#ff2947] h-[2px] rounded-[100px] shrink-0 w-full" data-name="Bar indicator" />
                    </div>
                  </div>
                </div>
                <FooterAtomProgressBarBackgroundImage />
                <FooterAtomProgressBarBackgroundImage />
                <FooterAtomProgressBarBackgroundImage />
              </div>
            </div>
            <div className="content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-full" data-name="Action Bar">
              <div className="h-full relative rounded-[32px] shrink-0" data-name="WEB Button">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex gap-[8px] h-full items-center justify-center py-[8px] relative">
                    <p className="decoration-solid font-['Montserrat:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#121e6c] text-[14px] text-center underline whitespace-nowrap">Atrás</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#ff2947] h-full relative rounded-[32px] shrink-0 w-[140px]" data-name="WEB Button">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] relative size-full">
                    <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">Continuar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_16.1px_0px_rgba(18,30,108,0.1)]" />
    </div>
  );
}