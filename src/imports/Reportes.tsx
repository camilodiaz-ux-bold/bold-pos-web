import clsx from "clsx";
import svgPaths from "./svg-malvytf2jl";
import imgFavicon from "figma:asset/0c96ccfbda7bda53f39c1437cf5bb8dbdf5b6a60.png";

function SettingOptionsBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[16px] self-stretch">
      <div className="content-stretch flex flex-col gap-[20px] items-start pb-[4px] pt-[16px] px-[16px] relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage1Props = {
  additionalClassNames?: string;
};

function BackgroundImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage1Props>) {
  return (
    <div className={additionalClassNames}>
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

function WebHeaderPanelWebButtonIconBackgroundImage1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative rounded-[100px] shrink-0 size-[40px]">
      <div className="absolute inset-[15%] rounded-[5px]" data-name="Color=White">
        {children}
      </div>
    </div>
  );
}

function BackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
      <div className="content-stretch flex gap-[12px] items-center px-[12px] py-[4px] relative size-full">{children}</div>
    </div>
  );
}

function WebAppAccordionBackgroundImage1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[56px] relative shrink-0 w-full">
      <BackgroundImage>{children}</BackgroundImage>
    </div>
  );
}

function WebAppAccordionBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[56px] relative shrink-0 w-full">
      <BackgroundImage>{children}</BackgroundImage>
      <div aria-hidden="true" className="absolute border-[#d2d4e1] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function AtomPanelMenuDefaultCategoryBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[10px] items-center justify-center px-[8px] py-[4px] relative w-full">{children}</div>
      </div>
    </div>
  );
}
type AtomPanelMenuBackgroundImageProps = {
  additionalClassNames?: string;
};

function AtomPanelMenuBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<AtomPanelMenuBackgroundImageProps>) {
  return (
    <div className={clsx("relative rounded-[8px] shrink-0", additionalClassNames)}>
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[8px] relative w-full">{children}</div>
      </div>
    </div>
  );
}

function WebHeaderPanelWebButtonIconBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative rounded-[100px] shrink-0 size-[40px]">
      <div className="absolute inset-[15%]" data-name="icon/ic_help">
        <div className="absolute inset-[8.33%]" data-name="Vector">
          {children}
        </div>
      </div>
    </div>
  );
}

function IconLeftBackgroundImage() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <div className="absolute inset-[4.17%_12.5%_3.29%_16.67%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.1667 18.5083">
          <g id="Vector">
            <path clipRule="evenodd" d={svgPaths.p467bf00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3e7d2100} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2b3ab880} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2317dc00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p82f0270} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function IconIcChevronBackgroundImage() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <div className="absolute flex inset-[8.33%_25.72%_8.33%_25.67%] items-center justify-center">
        <div className="-rotate-90 flex-none h-[11.667px] w-[20px]">
          <div className="relative size-full" data-name="Vector 2 (Stroke)">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 11.6667">
              <path clipRule="evenodd" d={svgPaths.p32a7b500} fill="var(--fill-0, #6C759F)" fillRule="evenodd" id="Vector 2 (Stroke)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
type AtomPlaceholderTextBackgroundImageAndTextProps = {
  text: string;
};

function AtomPlaceholderTextBackgroundImageAndText({ text }: AtomPlaceholderTextBackgroundImageAndTextProps) {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative">
      <div className="content-stretch flex items-start py-[8px] relative w-full">
        <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
          <p className="leading-[20px]">{text}</p>
        </div>
      </div>
    </div>
  );
}

function IconIcFilledChevronBackgroundImage() {
  return (
    <div className="relative shrink-0 size-[18px]">
      <div className="absolute flex inset-[29.17%_19.53%_35.18%_19.53%] items-center justify-center">
        <div className="flex-none h-[8.558px] rotate-180 w-[14.624px]">
          <div className="relative size-full">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.9683 6.41833">
              <path d={svgPaths.p2f13c880} fill="var(--fill-0, #606060)" id="Polygon 8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
type WebHeaderPanelIconIcMerchantIdBackgroundImageAndTextProps = {
  text: string;
};

function WebHeaderPanelIconIcMerchantIdBackgroundImageAndText({ text }: WebHeaderPanelIconIcMerchantIdBackgroundImageAndTextProps) {
  return (
    <div className="bg-[#121e6c] relative rounded-[100px] shrink-0 size-[32px]">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[14px] text-center text-white w-full">
            <p className="leading-[20px]">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
type WebHeaderPanelAtomTabsBackgroundImageAndTextProps = {
  text: string;
};

function WebHeaderPanelAtomTabsBackgroundImageAndText({ text }: WebHeaderPanelAtomTabsBackgroundImageAndTextProps) {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[100px]">
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[16px] relative size-full">
          <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[12px] whitespace-nowrap">
            <p className="leading-[16px]">{text}</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#babdd3] border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}
type WebHeaderPanelProps = {
  className?: string;
  company?: "SAS" | "CF";
  type?: "Dashboard" | "Internal";
};

function WebHeaderPanel({ className, company = "CF", type = "Dashboard" }: WebHeaderPanelProps) {
  const isCfAndInternal = company === "CF" && type === "Internal";
  const isSasAndIsDashboardOrInternal = company === "SAS" && ["Dashboard", "Internal"].includes(type);
  return (
    <div className={className || "relative w-[1280px]"}>
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] py-[4px] relative w-full">
          <div className="h-[24px] relative shrink-0 w-[68px]" data-name="Logotype / Bold">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isCfAndInternal ? "0 0 68 24" : "0 0 141 50"}>
              <path d={isSasAndIsDashboardOrInternal ? svgPaths.p22b33940 : isCfAndInternal ? svgPaths.p207500a0 : svgPaths.pde68df0} fill={isSasAndIsDashboardOrInternal ? "url(#paint0_linear_826_49111)" : "var(--fill-0, #121E6C)"} id="Vector" />
              {isSasAndIsDashboardOrInternal && (
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_826_49111" x1="141" x2="-3.518e-06" y1="25" y2="25">
                    <stop offset="0.045" stopColor="#EE424E" />
                    <stop offset="0.8" stopColor="#121E6C" />
                  </linearGradient>
                </defs>
              )}
            </svg>
          </div>
          {type === "Dashboard" && ["CF", "SAS"].includes(company) && (
            <div className="h-[32px] relative rounded-[100px] shrink-0 w-[156px]" data-name="WEB Tabs">
              <div className="content-stretch flex gap-[8px] items-start relative size-full">
                <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[100px]" data-name=".atom/tabs" style={{ backgroundImage: "linear-gradient(-89.9193deg, rgb(199, 60, 83) 0%, rgb(62, 37, 102) 99.969%)" }}>
                  <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
                      <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
                        <p className="leading-[16px]">Tab label</p>
                      </div>
                    </div>
                  </div>
                </div>
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
                <WebHeaderPanelAtomTabsBackgroundImageAndText text="Tab label" />
              </div>
            </div>
          )}
          {(isCfAndInternal || (company === "SAS" && type === "Dashboard") || (company === "SAS" && type === "Internal")) && (
            <div className="content-stretch flex items-center relative shrink-0" data-name="Actions">
              <WebHeaderPanelWebButtonIconBackgroundImage>
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isSasAndIsDashboardOrInternal ? "0 0 20 20" : "0 0 23.3333 23.3333"}>
                  <g id="Vector">
                    <path clipRule="evenodd" d={isSasAndIsDashboardOrInternal ? svgPaths.p164f4700 : svgPaths.p26351f40} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={isSasAndIsDashboardOrInternal ? svgPaths.pa4ed000 : svgPaths.p27058580} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path d={isSasAndIsDashboardOrInternal ? svgPaths.p3a34c600 : svgPaths.p32f69c00} fill="var(--fill-0, #121E6C)" />
                  </g>
                </svg>
              </WebHeaderPanelWebButtonIconBackgroundImage>
              <WebHeaderPanelWebButtonIconBackgroundImage1>
                <div className={`absolute ${isSasAndIsDashboardOrInternal ? "inset-[15%_20.78%_15%_20%]" : "inset-[15%_21.88%_15%_21.12%]"}`} data-name="Union">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isSasAndIsDashboardOrInternal ? "0 0 23.6893 28" : "0 0 15.961 19.5996"}>
                    <path d={isSasAndIsDashboardOrInternal ? svgPaths.p3094b200 : svgPaths.p2031400} fill={isSasAndIsDashboardOrInternal ? "var(--fill-0, white)" : "var(--fill-0, #121E6C)"} id="Union" />
                  </svg>
                </div>
              </WebHeaderPanelWebButtonIconBackgroundImage1>
              <WebHeaderPanelIconIcMerchantIdBackgroundImageAndText text="RA" />
            </div>
          )}
          {company === "CF" && type === "Dashboard" && (
            <div className="content-stretch flex items-center relative shrink-0" data-name="Account actions">
              <div className="content-stretch flex items-center relative shrink-0" data-name="Actions">
                <WebHeaderPanelWebButtonIconBackgroundImage>
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                    <g id="Vector">
                      <path clipRule="evenodd" d={svgPaths.p164f4700} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.pa4ed000} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                      <path d={svgPaths.p3a34c600} fill="var(--fill-0, #121E6C)" />
                    </g>
                  </svg>
                </WebHeaderPanelWebButtonIconBackgroundImage>
                <WebHeaderPanelWebButtonIconBackgroundImage1>
                  <div className="absolute inset-[15%_20.78%_15%_20%]" data-name="Union">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.6893 28">
                      <path d={svgPaths.p3094b200} fill="var(--fill-0, white)" id="Union" />
                    </svg>
                  </div>
                </WebHeaderPanelWebButtonIconBackgroundImage1>
                <WebHeaderPanelIconIcMerchantIdBackgroundImageAndText text="RA" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Reportes() {
  return (
    <div className="bg-[#f7f8fb] relative size-full" data-name="Reportes">
      <div className="absolute contents left-[1297px] top-[82px]">
        <div className="absolute bg-[rgba(241,242,246,0.02)] h-[35px] left-[1297px] top-[82px] w-[75px]" />
      </div>
      <div className="absolute left-0 top-0 w-[1280px]" data-name="Browser Bar / Desktop">
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
                      <p className="leading-[normal]">BoldPOS</p>
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
              <BackgroundImage1 additionalClassNames="relative shrink-0 size-[16px]">
                <g id="Icon - More">
                  <path clipRule="evenodd" d={svgPaths.p35109ec0} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage1>
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
                    <p className="leading-[normal]">pos.bold.co</p>
                  </div>
                  <div className="flex flex-col justify-center relative shrink-0 text-[#696a6c]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <p className="leading-[normal]">/cotizaciones/</p>
                  </div>
                </div>
              </div>
              <BackgroundImage1 additionalClassNames="relative shrink-0 size-[16px]">
                <g id="Icon - Favorite">
                  <path clipRule="evenodd" d={svgPaths.p127de900} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage1>
            </div>
            <div className="-translate-y-1/2 absolute content-stretch flex gap-[15px] items-start left-[12px] top-1/2" data-name="Left Locked Icons">
              <BackgroundImage1 additionalClassNames="relative shrink-0 size-[16px]">
                <g id="Back">
                  <path clipRule="evenodd" d={svgPaths.p18d60780} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage1>
              <BackgroundImage1 additionalClassNames="relative shrink-0 size-[16px]">
                <g id="Forward">
                  <path clipRule="evenodd" d={svgPaths.p245be700} fill="var(--fill-0, #BABCBE)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage1>
              <BackgroundImage1 additionalClassNames="relative shrink-0 size-[16px]">
                <g id="Refresh">
                  <path clipRule="evenodd" d={svgPaths.p6e12800} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage1>
              <BackgroundImage1 additionalClassNames="relative shrink-0 size-[16px]">
                <g id="Home">
                  <path d={svgPaths.p38af0f40} fill="var(--fill-0, #5F6368)" id="Container" />
                </g>
              </BackgroundImage1>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-white h-[572px] left-[8px] rounded-[16px] top-[136px] w-[212px]" data-name="WEB Menu V2">
        <div className="content-stretch flex flex-col gap-[18px] items-start pb-[8px] pt-[16px] px-[8px] relative size-full">
          <div className="content-stretch flex gap-[12px] items-start pl-[8px] relative shrink-0 w-[196px]" data-name=".atom/panel_menu">
            <div className="content-stretch flex flex-[1_0_0] flex-col items-start leading-[0] min-h-px min-w-px relative" data-name="Text">
              <div className="flex flex-col font-['Montserrat:Semibold',sans-serif] h-[24px] justify-center not-italic overflow-hidden relative shrink-0 text-[#121e6c] text-[14px] text-ellipsis w-full whitespace-nowrap">
                <p className="leading-[20px] overflow-hidden">{`Ramiro Ramos `}</p>
              </div>
              <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#969696] text-[11px] w-full">
                <p className="leading-[14px]">Administrador</p>
              </div>
            </div>
            <div className="content-stretch flex items-center justify-center relative shrink-0 size-[24px]" data-name="Icon">
              <div className="h-[22px] relative shrink-0 w-[20px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 22">
                  <g id="Group 288">
                    <rect height="21" id="Rectangle 26" rx="2.5" stroke="var(--stroke-0, #121E6C)" width="19" x="0.5" y="0.5" />
                    <path d="M16 16L11 11L16 6" id="Vector 78" stroke="var(--stroke-0, #121E6C)" strokeLinecap="round" />
                    <path d="M7.5 0.5V21.5" id="Vector 79" stroke="var(--stroke-0, #121E6C)" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
            <div className="bg-white col-1 ml-0 mt-0 relative rounded-[100px] row-1" data-name="Dropdown">
              <div aria-hidden="true" className="absolute border border-[#d2d4e1] border-solid inset-0 pointer-events-none rounded-[100px]" />
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[8px] items-center p-[8px] relative">
                  <div className="relative shrink-0 size-[16px]" data-name="icon/ic_Sucursal">
                    <div className="absolute inset-[30%_6.34%_4.13%_6.48%]" data-name="Vector (Stroke)">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9496 10.5403">
                        <path clipRule="evenodd" d={svgPaths.p3855dc00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector (Stroke)" />
                      </svg>
                    </div>
                    <div className="absolute inset-[15%_20%_65%_20%]" data-name="Rectangle 1666 (Stroke)">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.6 3.2">
                        <path clipRule="evenodd" d={svgPaths.p3f205200} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Rectangle 1666 (Stroke)" />
                      </svg>
                    </div>
                    <div className="absolute inset-[5%_30%_80%_30%]" data-name="Rectangle 1667 (Stroke)">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.4 2.4">
                        <path clipRule="evenodd" d={svgPaths.p39d00c00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Rectangle 1667 (Stroke)" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col font-['Montserrat:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#121e6c] text-[12px] w-[130px]">
                    <p className="leading-[16px]">Principal</p>
                  </div>
                  <div className="relative shrink-0 size-[16px]" data-name="icon/ic_chevron">
                    <div className="absolute bottom-[26.39%] left-[8.33%] right-[8.33%] top-1/4" data-name="Vector 2 (Stroke)">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 7.77778">
                        <path clipRule="evenodd" d={svgPaths.p349ee480} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector 2 (Stroke)" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#121e6c] col-1 h-[40px] ml-0 mt-[46px] relative rounded-[12px] row-1 w-[196px]" data-name="APP Button / Action">
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative size-full">
                  <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon/ic_add">
                    <BackgroundImage1 additionalClassNames="absolute inset-[16.67%]">
                      <g id="Vector">
                        <path clipRule="evenodd" d={svgPaths.pb621000} fill="var(--fill-0, white)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p2a5f5a00} fill="var(--fill-0, white)" fillRule="evenodd" />
                      </g>
                    </BackgroundImage1>
                  </div>
                  <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">Nueva venta</p>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
              <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
                <AtomPanelMenuBackgroundImage additionalClassNames="w-full">
                  <div className="relative shrink-0 size-[16px]" data-name="icon/ic_home">
                    <div className="absolute inset-[4.17%_6.04%_2.25%_4.17%]" data-name="Vector">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.3667 14.9733">
                        <path clipRule="evenodd" d={svgPaths.p2c299180} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" id="Vector" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
                    <p className="leading-[20px]">Inicio</p>
                  </div>
                </AtomPanelMenuBackgroundImage>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
              <AtomPanelMenuDefaultCategoryBackgroundImage>
                <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon_fill/ic_POS">
                  <div className="absolute inset-[16.67%_16.67%_20.83%_16.67%]" data-name="Vector">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10">
                      <path d={svgPaths.p259247c0} fill="var(--fill-0, #606060)" id="Vector" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#606060] text-[14px]">
                  <p className="leading-[16px]">Punto de venta</p>
                </div>
                <IconIcFilledChevronBackgroundImage />
              </AtomPanelMenuDefaultCategoryBackgroundImage>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
            <AtomPanelMenuDefaultCategoryBackgroundImage>
              <div className="relative shrink-0 size-[16px]" data-name="icon_fill/ic_money">
                <div className="absolute inset-[4.17%]" data-name="Subtract">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
                    <path clipRule="evenodd" d={svgPaths.p33752800} fill="var(--fill-0, #606060)" fillRule="evenodd" id="Subtract" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#606060] text-[14px]">
                <p className="leading-[16px]">INgresos</p>
              </div>
              <IconIcFilledChevronBackgroundImage />
            </AtomPanelMenuDefaultCategoryBackgroundImage>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
            <AtomPanelMenuDefaultCategoryBackgroundImage>
              <BackgroundImage1 additionalClassNames="relative shrink-0 size-[16px]">
                <g id="icon_fill/ic_automatic_billing">
                  <g id="Vector">
                    <path clipRule="evenodd" d={svgPaths.p18e15600} fill="#606060" fillRule="evenodd" />
                    <path d={svgPaths.p2f254f2} fill="var(--fill-0, #606060)" />
                  </g>
                </g>
              </BackgroundImage1>
              <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#606060] text-[14px]">
                <p className="leading-[16px]">Egresos</p>
              </div>
              <IconIcFilledChevronBackgroundImage />
            </AtomPanelMenuDefaultCategoryBackgroundImage>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
            <AtomPanelMenuDefaultCategoryBackgroundImage>
              <div className="relative shrink-0 size-[16px]" data-name="icon_fill/ic_sale">
                <div className="absolute inset-[4.17%_13.3%]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.7433 14.6667">
                    <g id="Vector">
                      <path d={svgPaths.p1bc31500} fill="var(--fill-0, #606060)" />
                      <path d={svgPaths.pe3ea700} fill="white" />
                      <path d={svgPaths.p35526d00} fill="white" />
                      <path d={svgPaths.p2f28bb00} fill="var(--fill-0, #606060)" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#606060] text-[14px]">
                <p className="leading-[16px]">Ítems</p>
              </div>
              <IconIcFilledChevronBackgroundImage />
            </AtomPanelMenuDefaultCategoryBackgroundImage>
          </div>
          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Category">
            <AtomPanelMenuBackgroundImage additionalClassNames="w-full">
              <div className="relative shrink-0 size-[16px]" data-name="icon/ic_users">
                <div className="absolute inset-[5.65%_3.75%]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8002 14.1933">
                    <path clipRule="evenodd" d={svgPaths.p3eda4380} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" id="Vector" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
                <p className="leading-[20px]">Contactos</p>
              </div>
            </AtomPanelMenuBackgroundImage>
            <AtomPanelMenuBackgroundImage additionalClassNames="w-full">
              <div className="relative shrink-0 size-[16px]" data-name="icon/ic_chart">
                <div className="absolute inset-[9.5%_4.5%]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.56 12.96">
                    <g id="Vector">
                      <path clipRule="evenodd" d={svgPaths.p9bf4180} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p34fffa00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p5d6fc00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p3f43a400} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.pced04f0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p25551c00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
                <p className="leading-[20px]">Reportes</p>
              </div>
            </AtomPanelMenuBackgroundImage>
            <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
              <AtomPanelMenuBackgroundImage additionalClassNames="w-[192px]">
                <div className="relative shrink-0 size-[16px]" data-name="icon/ic_settings">
                  <div className="absolute inset-[4.5%_8.1%]" data-name="Vector">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.408 14.56">
                      <g id="Vector">
                        <path clipRule="evenodd" d={svgPaths.p165ec280} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p3f7d8500} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p329f3600} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p2cb15e00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p18a3d980} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p15adf880} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.pef8fd00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p24486800} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.pf4c7d80} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p2041fac0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p3d87fba0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p548e300} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p1f6e5ff0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
                  <p className="leading-[20px]">Ajustes</p>
                </div>
              </AtomPanelMenuBackgroundImage>
            </div>
            <AtomPanelMenuBackgroundImage additionalClassNames="w-full">
              <div className="relative shrink-0 size-[16px]" data-name="icon/ic_comment">
                <div className="absolute inset-[8.33%_3.33%_8.66%_4.17%]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8 13.2803">
                    <g id="Vector">
                      <path clipRule="evenodd" d={svgPaths.p3c542b00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p118dbb00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p13008500} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p1e18cc80} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p19aa5e00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
                <p className="leading-[20px]">Chat con soporte</p>
              </div>
            </AtomPanelMenuBackgroundImage>
          </div>
        </div>
      </div>
      <div className="absolute h-[562px] left-[244px] top-[168px] w-[944px]">
        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[36px] left-0 text-[#121e6c] text-[24px] top-0 whitespace-nowrap">Reportes</p>
        <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 top-[71px] w-[944px]">
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <div className="content-stretch flex gap-[16px] h-[452px] items-start relative shrink-0 w-full">
              <SettingOptionsBackgroundImage>
                <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[16px] w-full">
                  <p className="leading-[20px]">Administrativos</p>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <WebAppAccordionBackgroundImage>
                    <div className="relative shrink-0 size-[20px]" data-name="Icon left">
                      <div className="absolute inset-[9.23%_6.21%]" data-name="Vector">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5167 16.3083">
                          <path clipRule="evenodd" d={svgPaths.p27c66880} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector" />
                        </svg>
                      </div>
                      <div className="absolute flex inset-[69.58%_17.25%_9.25%_17.4%] items-center justify-center">
                        <div className="-rotate-90 flex-none h-[15.685px] w-[5.08px]">
                          <div className="relative size-full" data-name="Vector">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.23333 13.0711">
                              <g id="Vector">
                                <path clipRule="evenodd" d={svgPaths.p3fc01ff0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                                <path clipRule="evenodd" d={svgPaths.p17dc2780} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                              </g>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="absolute flex inset-[22.08%_30.54%_37.92%_29.46%] items-center justify-center">
                        <div className="flex-none rotate-180 size-[9.6px]">
                          <div className="relative size-full" data-name="Vector">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                              <g id="Vector">
                                <path clipRule="evenodd" d={svgPaths.p1a3ed6f0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                                <path clipRule="evenodd" d={svgPaths.pd508300} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                                <path clipRule="evenodd" d={svgPaths.pff2d600} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                                <path clipRule="evenodd" d={svgPaths.p1a533000} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                              </g>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <AtomPlaceholderTextBackgroundImageAndText text="Cierre de caja" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <div className="relative shrink-0 size-[20px]" data-name="Icon left">
                      <div className="-translate-x-1/2 absolute aspect-[421.2482604980469/418.505126953125] bottom-[4.17%] left-1/2 top-[4.17%]" data-name="Vector">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.4535 18.3333">
                          <g id="Vector">
                            <path d={svgPaths.p205ece00} fill="var(--fill-0, #121E6C)" />
                            <path d={svgPaths.p35690100} fill="var(--fill-0, #121E6C)" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <AtomPlaceholderTextBackgroundImageAndText text="Cierre de caja gerencial" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <div className="relative shrink-0 size-[20px]" data-name="Icon left">
                      <div className="absolute inset-[4.06%_14.56%]" data-name="Vector">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.1768 18.375">
                          <g id="Vector">
                            <path clipRule="evenodd" d={svgPaths.p1f80cf80} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p25f8e380} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <AtomPlaceholderTextBackgroundImageAndText text="Lista de ítems" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <div className="relative shrink-0 size-[20px]" data-name="Icon left">
                      <div className="-translate-y-1/2 absolute aspect-[22/22] left-[4.17%] right-[4.17%] top-1/2" data-name="Vector">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
                          <path d={svgPaths.p64c7180} fill="var(--fill-0, #121E6C)" id="Vector" />
                        </svg>
                      </div>
                    </div>
                    <AtomPlaceholderTextBackgroundImageAndText text="Inventarios" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Icon left">
                      <div className="absolute inset-[12.5%_4.17%_16.28%_4.17%]" data-name="Vector">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 14.2432">
                          <g id="Vector">
                            <path clipRule="evenodd" d={svgPaths.p381bee00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p32f45e00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p3321c280} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p1077c900} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <AtomPlaceholderTextBackgroundImageAndText text="Ingresos y egresos" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <div className="relative shrink-0 size-[20px]" data-name="Icon left">
                      <div className="absolute inset-[5.54%_3.98%]" data-name="Vector">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.4091 17.7833">
                          <g id="Vector">
                            <path clipRule="evenodd" d={svgPaths.p1f221280} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p4536e80} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p20ae1380} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p1126de00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p1bf30b32} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p15be100} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                            <path clipRule="evenodd" d={svgPaths.p396c2700} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <AtomPlaceholderTextBackgroundImageAndText text="Cuentas por cobrar" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage1>
                    <div className="relative shrink-0 size-[20px]" data-name="Icon left">
                      <div className="absolute inset-[5.65%_3.75%]" data-name="Vector">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.5002 17.7417">
                          <path clipRule="evenodd" d={svgPaths.p1a4b7400} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector" />
                        </svg>
                      </div>
                    </div>
                    <AtomPlaceholderTextBackgroundImageAndText text="Lista de contactos" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage1>
                </div>
              </SettingOptionsBackgroundImage>
              <SettingOptionsBackgroundImage>
                <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[16px] w-full">
                  <p className="leading-[20px]">Ventas</p>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <WebAppAccordionBackgroundImage>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Comprobantes" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Comprobantes mensuales" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Ventas por ítems" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Ganancias por ítems" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Comprobantes por vendedor" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage1>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Cotizaciones" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage1>
                </div>
              </SettingOptionsBackgroundImage>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-[464px]">
            <div className="content-stretch flex h-[284px] items-start relative shrink-0 w-full">
              <SettingOptionsBackgroundImage>
                <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[16px] w-full">
                  <p className="leading-[20px]">Documentos electrónicos</p>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <WebAppAccordionBackgroundImage>
                    <div className="relative shrink-0 size-[20px]" data-name="Icon left">
                      <div className="absolute inset-[2.08%_2.67%]" data-name="Vector">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9334 19.1667">
                          <path clipRule="evenodd" d={svgPaths.p3a3d7900} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector" />
                        </svg>
                      </div>
                    </div>
                    <AtomPlaceholderTextBackgroundImageAndText text="Facturas de venta" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Notas crédito" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Notas debito" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage>
                  <WebAppAccordionBackgroundImage1>
                    <IconLeftBackgroundImage />
                    <AtomPlaceholderTextBackgroundImageAndText text="Documentos soporte" />
                    <IconIcChevronBackgroundImage />
                  </WebAppAccordionBackgroundImage1>
                </div>
              </SettingOptionsBackgroundImage>
            </div>
          </div>
        </div>
      </div>
      <WebHeaderPanel className="absolute left-[-2px] top-[88px] w-[1280px]" type="Internal" />
    </div>
  );
}