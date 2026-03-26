import clsx from "clsx";
import svgPaths from "./svg-c8617rohvs";
import imgFavicon from "figma:asset/0c96ccfbda7bda53f39c1437cf5bb8dbdf5b6a60.png";
type TextInputsBackgroundImageProps = {
  additionalClassNames?: string;
};

function TextInputsBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<TextInputsBackgroundImageProps>) {
  return (
    <div className={clsx("relative", additionalClassNames)}>
      <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">{children}</div>
    </div>
  );
}

function BackgroundImage3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        {children}
      </svg>
    </div>
  );
}
type BackgroundImage2Props = {
  additionalClassNames?: string;
};

function BackgroundImage2({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage2Props>) {
  return (
    <div className={clsx("relative size-[20px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
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

function AtomTextInputLabelsBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-start justify-end relative w-full">
          <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Semibold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#121e6c] text-[14px]">
            <p>{children}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemBackgroundImage6() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-[24px]" data-name="icon/ic_shopping_cart">
        <div className="absolute inset-[6.6%_4.29%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.9408 20.83">
            <g id="Vector">
              <path clipRule="evenodd" d={svgPaths.p820ee00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p26c8f600} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p928d600} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2510ad00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <TextBackgroundImageAndText text="Ítems con Variantes" />
    </div>
  );
}

function ItemBackgroundImage5() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-[24px]" data-name="icon/ic_automatic_billing">
        <div className="absolute inset-[2.08%_2.67%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.7201 23">
            <path clipRule="evenodd" d={svgPaths.p2e4e9400} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
        <p className="font-['Montserrat:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1e1e1e] text-[0px] text-[12px] whitespace-nowrap">
          <span className="leading-[16px]">{"Facturas electrónicas ilimitadas"}</span>
          <span className="[text-decoration-skip-ink:none] decoration-solid leading-[16px] line-through">
            <br aria-hidden="true" />
          </span>
          <span className="[text-decoration-skip-ink:none] decoration-solid leading-[16px] line-through text-[#606060]">{"200 Facturas electrónicas al mes"}</span>
        </p>
      </div>
    </div>
  );
}

function IconIcSupportBackgroundImage() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]">
      <div className="absolute inset-[4.17%_2.38%_6.63%_4.17%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.4295 21.41">
          <g id="Vector">
            <path clipRule="evenodd" d={svgPaths.p2e8822b0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p32733630} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p1f75c480} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p37b11ac0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p4d6aa10} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function ItemBackgroundImage4() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-[24px]" data-name="icon/ic_phone">
        <div className="absolute bottom-[3.29%] left-1/4 right-[23.42%] top-[4.17%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.38 22.21">
            <g id="Vector">
              <path clipRule="evenodd" d={svgPaths.p1ddc1280} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p1670baf0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p131a8000} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <TextBackgroundImageAndText text="App móvil (Android y iOS)" />
    </div>
  );
}

function ItemBackgroundImage3() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-[24px]" data-name="icon/ic_coin">
        <div className="absolute inset-[8.33%_6.17%_6.17%_8.33%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.52 20.52">
            <g id="Vector">
              <path clipRule="evenodd" d={svgPaths.p3d8b2880} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p17b83a80} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p905f800} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p94ae000} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <TextBackgroundImageAndText text="Ingresos / Ventas ilimitadas" />
    </div>
  );
}

function ItemBackgroundImage2() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-[24px]" data-name="icon/ic_chart">
        <div className="absolute inset-[9.5%_4.5%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.84 19.44">
            <g id="Vector">
              <path clipRule="evenodd" d={svgPaths.p19bffc40} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p374a900} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.pa85dcd0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p245b4f00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p21937280} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2719fe00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <TextBackgroundImageAndText text="Ventas, Inventarios y Reportes" />
    </div>
  );
}

function ItemBackgroundImage1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-[24px]" data-name="icon/ic_people">
        <div className="absolute inset-[8.48%_11.83%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3235 19.93">
            <g id="Vector">
              <path clipRule="evenodd" d={svgPaths.p31b12600} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2d283280} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <TextBackgroundImageAndText text="1 Usuario" />
    </div>
  );
}

function ItemBackgroundImage() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-[24px]" data-name="icon/ic_store">
        <div className="absolute inset-[8.33%_3.27%_8.17%_4.16%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.2158 20.04">
            <g id="Vector">
              <path clipRule="evenodd" d={svgPaths.p1f7565a0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2389b570} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p32465f00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p13a11f2} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <TextBackgroundImageAndText text="1 Sucursal" />
    </div>
  );
}
type TextBackgroundImageAndTextProps = {
  text: string;
};

function TextBackgroundImageAndText({ text }: TextBackgroundImageAndTextProps) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
      <p className="font-['Montserrat:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-full">{text}</p>
    </div>
  );
}
type BackgroundImage1Props = {
  text: string;
  text1: string;
};

function BackgroundImage1({ text, text1 }: BackgroundImage1Props) {
  return (
    <div className="content-stretch flex font-['Montserrat:Regular',sans-serif] font-normal gap-[2px] items-center leading-[0] relative shrink-0 text-[#1e1e1e]">
      <div className="flex flex-col justify-end relative shrink-0 text-[40px] whitespace-nowrap">
        <p className="leading-[60px]">{text}</p>
      </div>
      <div className="flex flex-col h-[40px] justify-end relative shrink-0 text-[12px] w-[30px]">
        <p className="leading-[16px]">{text1}</p>
      </div>
    </div>
  );
}

function BackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="content-stretch flex h-[28px] items-center relative shrink-0 w-[332px]">
      <div className="relative rounded-[8px] shrink-0" data-name="WEB/APP Tag" style={{ backgroundImage: "linear-gradient(-90deg, rgb(238, 66, 78) 4.5%, rgb(18, 30, 108) 80%)" }}>
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[4px] items-center justify-center px-[8px] py-[4px] relative">
            <div className="relative shrink-0 size-[16px]" data-name="icon_fill/ic_star">
              <div className="absolute inset-[4.17%_2.73%]" data-name="Vector">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.1249 14.6667">
                  <path d={svgPaths.p3f49f280} fill="var(--fill-0, white)" id="Vector" />
                </svg>
              </div>
            </div>
            <div className="relative shrink-0" data-name=".atom/tag_label">
              <div className="content-stretch flex items-start relative">
                <div className="flex flex-col font-['Montserrat:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
                  <p className="leading-[16px]">{children}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
type AtomTextInputLabelsBackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function AtomTextInputLabelsBackgroundImageAndText({ text, additionalClassNames = "" }: AtomTextInputLabelsBackgroundImageAndTextProps) {
  return (
    <div className={clsx("flex-[1_0_0] min-h-px min-w-px relative", additionalClassNames)}>
      <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#606060] text-[14px]">
        <p className="leading-[20px]">{text}</p>
      </div>
    </div>
  );
}
type AtomTextInputFieldsBackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function AtomTextInputFieldsBackgroundImageAndText({ text, additionalClassNames = "" }: AtomTextInputFieldsBackgroundImageAndTextProps) {
  return (
    <div className={clsx("bg-white h-[40px] relative rounded-[12px]", additionalClassNames)}>
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-center justify-end p-[12px] relative size-full">
          <AtomTextInputLabelsBackgroundImageAndText text={text} additionalClassNames="h-full" />
        </div>
      </div>
    </div>
  );
}
type BackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function BackgroundImageAndText({ text, additionalClassNames = "" }: BackgroundImageAndTextProps) {
  return (
    <div style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 whitespace-nowrap", additionalClassNames)}>
      <p className="leading-[normal]">{text}</p>
    </div>
  );
}

export default function DatosVacios() {
  return (
    <div className="bg-[#f7f8fb] relative size-full" data-name="Datos vacios">
      <div className="-translate-x-1/2 absolute left-1/2 top-0 w-[1280px]" data-name="Browser Bar / Desktop">
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
                    <BackgroundImageAndText text="Bold" additionalClassNames="text-[#494c4f] text-[12px] tracking-[0.2px]" />
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
                <BackgroundImage2 additionalClassNames="shrink-0">
                  <g id="Plus">
                    <path clipRule="evenodd" d={svgPaths.p2320e500} fill="var(--fill-0, #3C4043)" fillRule="evenodd" id="Icon - New Tab" />
                  </g>
                </BackgroundImage2>
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
              <BackgroundImage3>
                <g id="Icon - More">
                  <path clipRule="evenodd" d={svgPaths.p35109ec0} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage3>
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
                <div className="content-stretch flex items-center relative shrink-0" data-name="Text">
                  <BackgroundImageAndText text="checkout.bold.co" additionalClassNames="text-[#606060] text-[14px]" />
                </div>
              </div>
              <BackgroundImage3>
                <g id="Icon - Favorite">
                  <path clipRule="evenodd" d={svgPaths.p127de900} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage3>
            </div>
            <div className="-translate-y-1/2 absolute content-stretch flex gap-[15px] items-start left-[12px] top-1/2" data-name="Left Locked Icons">
              <BackgroundImage3>
                <g id="Back">
                  <path clipRule="evenodd" d={svgPaths.p18d60780} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage3>
              <BackgroundImage3>
                <g id="Forward">
                  <path clipRule="evenodd" d={svgPaths.p245be700} fill="var(--fill-0, #BABCBE)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage3>
              <BackgroundImage3>
                <g id="Refresh">
                  <path clipRule="evenodd" d={svgPaths.p6e12800} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage3>
              <BackgroundImage3>
                <g id="Home">
                  <path d={svgPaths.p38af0f40} fill="var(--fill-0, #5F6368)" id="Container" />
                </g>
              </BackgroundImage3>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[40px] items-center left-[128px] top-[104px] w-[589px]" data-name="Pago">
        <div className="content-center flex flex-wrap gap-[465px] items-center justify-end relative shrink-0 w-full">
          <div className="h-[31px] relative shrink-0 w-[71px]" data-name="logotipo/bold">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 71.0066 31">
              <g id="logotipo/bold">
                <path d={svgPaths.p26322370} fill="url(#paint0_linear_404_1720)" id="Vector" />
              </g>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_404_1720" x1="71.0066" x2="-1.77164e-06" y1="15.5" y2="15.5">
                  <stop offset="0.045" stopColor="#EE424E" />
                  <stop offset="0.8" stopColor="#121E6C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="h-[10px] relative shrink-0 w-[53px]" data-name="Capa_1">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53 10">
              <g clipPath="url(#clip0_382_853)" id="Capa_1">
                <path d={svgPaths.p34f4d500} fill="var(--fill-0, #121E6C)" id="Vector" />
                <path d={svgPaths.p39bab080} fill="var(--fill-0, #121E6C)" id="Vector_2" />
                <path d={svgPaths.pac48a00} fill="var(--fill-0, #121E6C)" id="Vector_3" />
                <path d={svgPaths.p1197b700} fill="var(--fill-0, #121E6C)" id="Vector_4" />
                <path d={svgPaths.p25924600} fill="var(--fill-0, #121E6C)" id="Vector_5" />
                <path d={svgPaths.p3af20780} fill="var(--fill-0, #121E6C)" id="Vector_6" />
                <path d={svgPaths.p1c4dc500} fill="var(--fill-0, #121E6C)" id="Vector_7" />
              </g>
              <defs>
                <clipPath id="clip0_382_853">
                  <rect fill="white" height="10" width="53" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full" data-name="Forms">
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
            <p className="col-1 font-['Montserrat:Bold',sans-serif] font-bold leading-[32px] ml-0 mt-0 relative row-1 text-[#1e1e1e] text-[24px] w-[589px]">Crea tu cuenta</p>
            <div className="col-1 flex flex-col font-['Montserrat:Regular',sans-serif] font-normal h-[28px] justify-center ml-0 mt-[48px] relative row-1 text-[#606060] text-[14px] w-[452.657px]">
              <p className="leading-[21px]">POS Esencial gratis 15 días</p>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Info card">
              <TextInputsBackgroundImage additionalClassNames="shrink-0 w-full">
                <AtomTextInputLabelsBackgroundImage>
                  <span className="leading-[20px]">{`Nombre del negocio `}</span>
                  <span className="leading-[20px] text-[#c31a2f]">*</span>
                </AtomTextInputLabelsBackgroundImage>
                <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name=".atom/text_input_fields">
                  <div className="flex flex-row items-center justify-end size-full">
                    <div className="content-stretch flex gap-[12px] items-center justify-end px-[12px] py-[16px] relative w-full">
                      <AtomTextInputLabelsBackgroundImageAndText text="Nombre del negocio" additionalClassNames="h-[16px]" />
                    </div>
                  </div>
                </div>
              </TextInputsBackgroundImage>
              <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Row">
                <TextInputsBackgroundImage additionalClassNames="flex-[1_0_0] min-h-px min-w-px">
                  <AtomTextInputLabelsBackgroundImage>
                    <span className="leading-[20px]">{`Nombres `}</span>
                    <span className="leading-[20px] text-[#c31a2f]">*</span>
                    <span className="leading-[20px]">{` `}</span>
                  </AtomTextInputLabelsBackgroundImage>
                  <AtomTextInputFieldsBackgroundImageAndText text="Nombres" additionalClassNames="shrink-0 w-full" />
                </TextInputsBackgroundImage>
                <TextInputsBackgroundImage additionalClassNames="flex-[1_0_0] min-h-px min-w-px">
                  <AtomTextInputLabelsBackgroundImage>
                    <span className="leading-[20px]">{`Apellidos `}</span>
                    <span className="leading-[20px] text-[#c31a2f]">*</span>
                  </AtomTextInputLabelsBackgroundImage>
                  <AtomTextInputFieldsBackgroundImageAndText text="Apellidos" additionalClassNames="shrink-0 w-full" />
                </TextInputsBackgroundImage>
              </div>
              <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Row">
                <TextInputsBackgroundImage additionalClassNames="flex-[1_0_0] min-h-px min-w-px">
                  <AtomTextInputLabelsBackgroundImage>
                    <span className="leading-[20px]">{`Teléfono celular `}</span>
                    <span className="leading-[20px] text-[#c31a2f]">*</span>
                    <span className="leading-[20px]">{` `}</span>
                  </AtomTextInputLabelsBackgroundImage>
                  <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
                    <div className="bg-white relative rounded-[12px] shrink-0 w-[104px]" data-name=".atom/text_input_fields">
                      <div className="content-stretch flex flex-col items-start px-[12px] py-[8px] relative w-full">
                        <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Country code">
                          <div className="relative shrink-0 size-[24px]" data-name="Flag">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                              <g clipPath="url(#clip0_404_1702)" id="Flag">
                                <path d={svgPaths.p191fc670} fill="var(--fill-0, #2A5F9E)" id="Vector" />
                                <path d={svgPaths.p173f8b80} fill="var(--fill-0, #FFE62E)" id="Vector_2" />
                                <path d={svgPaths.p3944ac00} fill="var(--fill-0, #ED4C5C)" id="Vector_3" />
                              </g>
                              <defs>
                                <clipPath id="clip0_404_1702">
                                  <rect fill="white" height="24" width="24" />
                                </clipPath>
                              </defs>
                            </svg>
                          </div>
                          <div className="h-[16px] relative shrink-0 w-[28px]" data-name=".atom/text_input_labels">
                            <div className="absolute flex flex-col font-['Montserrat:Medium',sans-serif] font-medium inset-0 justify-center leading-[0] text-[#1e1e1e] text-[14px]">
                              <p className="leading-[20px]">+57</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <AtomTextInputFieldsBackgroundImageAndText text="Número de celular" additionalClassNames="flex-[1_0_0] min-h-px min-w-px" />
                  </div>
                </TextInputsBackgroundImage>
                <TextInputsBackgroundImage additionalClassNames="flex-[1_0_0] min-h-px min-w-px">
                  <AtomTextInputLabelsBackgroundImage>
                    <span className="leading-[20px]">{`Correo electrónico `}</span>
                    <span className="leading-[20px] text-[#c31a2f]">*</span>
                  </AtomTextInputLabelsBackgroundImage>
                  <AtomTextInputFieldsBackgroundImageAndText text="Correo" additionalClassNames="shrink-0 w-full" />
                </TextInputsBackgroundImage>
              </div>
            </div>
          </div>
        </div>
        <div className="relative shrink-0 w-full" data-name="WEB Radiobutton">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center relative w-full">
              <div className="overflow-clip relative shrink-0 size-[48px]" data-name=".atom/selection_type">
                <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[20px] top-1/2">
                  <div className="-scale-y-100 flex-none rotate-180">
                    <BackgroundImage2>
                      <path d={svgPaths.p23478671} fill="var(--fill-0, white)" id="Icon" stroke="var(--stroke-0, #121E6C)" />
                    </BackgroundImage2>
                  </div>
                </div>
              </div>
              <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[0px]">
                <p className="text-[14px] whitespace-pre-wrap">
                  <span className="leading-[20px]">{`Aceptar términos y condiciones  `}</span>
                  <span className="[text-decoration-skip-ink:none] decoration-solid font-['Montserrat:SemiBold',sans-serif] font-semibold leading-[24px] underline">Ver documento</span>
                  <span className="leading-[20px]">{` `}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[22px] items-start relative shrink-0 w-full">
          <div className="bg-[#f48990] relative rounded-[32px] shrink-0 w-[241px]" data-name="WEB Button">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[24px] py-[12px] relative w-full">
                <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Crear cuenta</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal h-[27px] justify-center leading-[0] relative shrink-0 text-[#606060] text-[0px] w-[589px]">
            <p className="text-[12px] whitespace-pre-wrap">
              <span className="leading-[normal]">{`¿Ya tienes cuenta Bold POS?  `}</span>
              <span className="decoration-solid font-['Montserrat:Medium',sans-serif] font-medium leading-[16px] text-[#121e6c] underline">Inicia sesión</span>
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bg-white content-stretch flex flex-col h-[672px] items-start left-[calc(66.67%-29.33px)] p-[52px] rounded-[24px] top-[104px] w-[436px]">
        <div className="content-stretch flex flex-col gap-[28px] items-start relative shrink-0 w-full" data-name="Purchase">
          <div className="bg-white content-stretch flex flex-col gap-[36px] items-start relative rounded-[20px] shrink-0 w-full" data-name="Features">
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0">
              <BackgroundImage>POS Esencial</BackgroundImage>
              <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal h-[28px] justify-center leading-[0] relative shrink-0 text-[#606060] text-[16px] w-[332px]">
                <p className="leading-[24px]">Prueba gratis por 15 días</p>
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
              <BackgroundImage1 text="$708.000" text1="/año" />
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
            <ItemBackgroundImage />
            <ItemBackgroundImage1 />
            <ItemBackgroundImage2 />
            <ItemBackgroundImage3 />
            <ItemBackgroundImage4 />
            <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Item">
              <IconIcSupportBackgroundImage />
              <TextBackgroundImageAndText text="Implementación virtual (Grupal)" />
            </div>
            <ItemBackgroundImage5 />
            <ItemBackgroundImage6 />
          </div>
        </div>
      </div>
      <div className="absolute bg-white content-stretch flex flex-col h-[672px] items-start left-[calc(66.67%-29.33px)] p-[52px] rounded-[24px] top-[104px] w-[436px]">
        <div className="content-stretch flex flex-col gap-[28px] items-start relative shrink-0 w-full" data-name="Purchase">
          <div className="bg-white content-stretch flex flex-col gap-[36px] items-start relative rounded-[20px] shrink-0 w-full" data-name="Features">
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0">
              <BackgroundImage>POS Esencial</BackgroundImage>
              <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal h-[28px] justify-center leading-[0] relative shrink-0 text-[#606060] text-[16px] w-[332px]">
                <p className="leading-[24px]">Prueba gratis por 15 días</p>
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
              <BackgroundImage1 text="$708.000" text1="/año" />
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
            <ItemBackgroundImage />
            <ItemBackgroundImage1 />
            <ItemBackgroundImage2 />
            <ItemBackgroundImage3 />
            <ItemBackgroundImage4 />
            <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Item">
              <IconIcSupportBackgroundImage />
              <TextBackgroundImageAndText text="Implementación virtual ($149.000)" />
            </div>
            <ItemBackgroundImage5 />
            <ItemBackgroundImage6 />
          </div>
        </div>
      </div>
    </div>
  );
}