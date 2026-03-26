import clsx from "clsx";
import svgPaths from "./svg-uu1cgrdgob";
import imgMockPosmObileTablet1 from "figma:asset/af1184e75b5337326c665057de04c7738af91369.png";

function BrowserBarMobileMoreMenu({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}

function BrowserBarMobileChromeTabs({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[22px] relative shrink-0 w-[21.12px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.12 22">
        {children}
      </svg>
    </div>
  );
}
type BrowserBarMobileHelperProps = {
  additionalClassNames?: string;
};

function BrowserBarMobileHelper({ children, additionalClassNames = "" }: React.PropsWithChildren<BrowserBarMobileHelperProps>) {
  return (
    <div style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[15px] whitespace-nowrap", additionalClassNames)}>
      <p className="leading-[13px]">{children}</p>
    </div>
  );
}

function BrowserBarMobileVector({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[13px] relative shrink-0 w-[10px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 13">
        {children}
      </svg>
    </div>
  );
}
type BrowserBarMobileSearchbarProps = {
  additionalClassNames?: string;
};

function BrowserBarMobileSearchbar({ children, additionalClassNames = "" }: React.PropsWithChildren<BrowserBarMobileSearchbarProps>) {
  return (
    <div className={clsx("flex-[1_0_0] h-[36px] min-h-px min-w-px overflow-clip relative rounded-[18px]", additionalClassNames)}>
      <div className="-translate-y-1/2 absolute content-stretch flex gap-[10px] items-start left-[13px] top-1/2" data-name="Content">
        {children}
      </div>
    </div>
  );
}

function BrowserBarMobileUnion({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="-translate-y-1/2 absolute h-[18px] right-[17px] top-1/2 w-[14px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 18">
        {children}
      </svg>
    </div>
  );
}
type BrowserBarMobileIosChromeBarProps = {
  additionalClassNames?: string;
};

function BrowserBarMobileIosChromeBar({ children, additionalClassNames = "" }: React.PropsWithChildren<BrowserBarMobileIosChromeBarProps>) {
  return (
    <div className={clsx("h-[50px] relative shrink-0 w-full", additionalClassNames)}>
      <div className="overflow-clip relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function BrowserBarMobileHome({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[22px] relative shrink-0 w-[21px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 22">
        <g id="Home">{children}</g>
      </svg>
    </div>
  );
}
type BrowserBarMobileBrowserBarAndroidChromeProps = {
  additionalClassNames?: string;
};

function BrowserBarMobileBrowserBarAndroidChrome({ children, additionalClassNames = "" }: React.PropsWithChildren<BrowserBarMobileBrowserBarAndroidChromeProps>) {
  return (
    <div className={clsx("relative shrink-0 w-full", additionalClassNames)}>
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[12px] py-[10px] relative w-full">{children}</div>
      </div>
    </div>
  );
}
type AtomTextInputLabelsText1Props = {
  text: string;
};

function AtomTextInputLabelsText1({ text }: AtomTextInputLabelsText1Props) {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative">
      <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#969696] text-[14px]">
        <p className="leading-[20px]">{text}</p>
      </div>
    </div>
  );
}
type AtomTextInputLabelsTextProps = {
  text: string;
};

function AtomTextInputLabelsText({ text }: AtomTextInputLabelsTextProps) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row justify-end size-full">
        <div className="content-stretch flex gap-[12px] items-start justify-end relative w-full">
          <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Semibold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#121e6c] text-[14px]">
            <p className="leading-[20px]">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
type BrowserBarMobileProps = {
  className?: string;
  showBrowser?: boolean;
  so?: "iOS" | "Android Phone";
  theme?: "Light" | "Dark";
  url?: string;
};

function BrowserBarMobile({ className, showBrowser = true, so = "iOS", theme = "Light", url = "Bold.co" }: BrowserBarMobileProps) {
  const isAndroidPhoneAndDark = so === "Android Phone" && theme === "Dark";
  const isAndroidPhoneAndIsLightOrDark = so === "Android Phone" && ["Light", "Dark"].includes(theme);
  const isIOsAndDark = so === "iOS" && theme === "Dark";
  return (
    <div className={className || `relative w-[375px] ${isAndroidPhoneAndIsLightOrDark ? "" : "h-[92px]"}`}>
      <div className={`flex flex-col ${isAndroidPhoneAndIsLightOrDark ? "content-stretch items-start relative w-full" : "items-center size-full"}`}>
        {so === "iOS" && ["Light", "Dark"].includes(theme) && (
          <div className="content-stretch flex flex-col items-center relative size-full">
            <div className={`relative shrink-0 w-full ${isIOsAndDark ? "bg-[#353739]" : "bg-[#f8f8f8]"}`} data-name=".atom/iOS_status_bar">
              <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center justify-between px-[10px] py-[13px] relative w-full">
                  <div className="h-[17.096px] relative shrink-0 w-[75px]" data-name="Time">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 17.0962">
                      <g id="Time">
                        <g id="Time_2">
                          <path d={svgPaths.p28d03b00} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} />
                          <path d={svgPaths.p26820d00} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} />
                          <path d={svgPaths.p2cf99000} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} />
                          <path d={svgPaths.p2c9a1200} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} />
                          <path d={svgPaths.pcbeb880} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} />
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="h-[12px] relative shrink-0 w-[66.5px]" data-name="Status Icons">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 66.5 12">
                      <g id="Status Icons">
                        <g id="Network Signal">
                          <path d={svgPaths.p2b90f980} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} id="NetworkSignal-path" />
                          <path d={svgPaths.p9778000} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} id="NetworkSignal-path_2" />
                          <path d={svgPaths.p2cb61900} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} id="NetworkSignal-path_3" />
                          <path d={svgPaths.p26488880} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillOpacity="0.2" id="NetworkSignal-path_4" />
                        </g>
                        <path d={svgPaths.pfe2ae80} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} id="Wi-Fi" />
                        <g id="Battery">
                          <rect height="11" id="Border" rx="2.16667" stroke={isIOsAndDark ? "var(--stroke-0, white)" : "var(--stroke-0, black)"} strokeOpacity="0.6" width="21.6077" x="42" y="0.5" />
                          <path d={svgPaths.p572c0e0} fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillOpacity="0.6" id="Cap" />
                          <rect fill={isIOsAndDark ? "var(--fill-0, white)" : "var(--fill-0, #1E1E1E)"} height="7.76471" id="Capacity" rx="1.33333" width="18.4972" x="43.5553" y="2.11768" />
                        </g>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {so === "iOS" && theme === "Light" && showBrowser && (
              <BrowserBarMobileIosChromeBar additionalClassNames="bg-[#f8f8f8]">
                <div className="absolute bg-[rgba(0,0,0,0.08)] h-[36px] left-[10px] right-[10px] rounded-[100px] top-[4px]" data-name="Search bar">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex items-center justify-center left-[calc(50%+5.5px)] top-[calc(50%+0.5px)]" data-name="iOS / Chrome / Address">
                    <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#1e1e1e] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {url}
                    </p>
                  </div>
                  <BrowserBarMobileUnion>
                    <path d={svgPaths.p2ed63cc0} fill="var(--fill-0, black)" fillOpacity="0.3" id="Union" />
                  </BrowserBarMobileUnion>
                </div>
              </BrowserBarMobileIosChromeBar>
            )}
            {isIOsAndDark && showBrowser && (
              <BrowserBarMobileIosChromeBar additionalClassNames="bg-[#353739]">
                <div className="absolute bg-[rgba(255,255,255,0.08)] h-[36px] left-[10px] right-[10px] rounded-[100px] top-[4px]" data-name="Search bar">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex items-center justify-center left-[calc(50%+5.5px)] top-[calc(50%+0.5px)]" data-name="iOS / Chrome / Address">
                    <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#f3f3f3] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {url}
                    </p>
                  </div>
                  <BrowserBarMobileUnion>
                    <path d={svgPaths.p2ed63cc0} fill="var(--fill-0, white)" fillOpacity="0.3" id="Union" />
                  </BrowserBarMobileUnion>
                </div>
              </BrowserBarMobileIosChromeBar>
            )}
          </div>
        )}
        {isAndroidPhoneAndIsLightOrDark && (
          <div className={`h-[32px] relative shrink-0 w-full ${isAndroidPhoneAndDark ? "bg-[#1e1e1e]" : "bg-white"}`} data-name=".atom/android_status_bar">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex items-center justify-between px-[16px] relative size-full">
                <p className={`font-["Roboto:Medium",sans-serif] font-medium h-[15px] leading-[normal] relative shrink-0 text-[13px] w-[33px] ${isAndroidPhoneAndDark ? "text-white" : "text-black"}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                  12:30
                </p>
                <div className="content-stretch flex gap-[10px] items-center px-[8px] py-[4px] relative shrink-0" data-name="status bar content">
                  <div className="h-[12px] relative shrink-0 w-[16px]" data-name="wifi">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 12">
                      <g id="wifi">
                        <mask height="12" id={isAndroidPhoneAndDark ? "mask0_382_903" : "mask0_382_961"} maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="16" x="0" y="0">
                          <path clipRule="evenodd" d="M0 0V3L8 12L16 3V0H8H0Z" fill="var(--fill-0, white)" fillRule="evenodd" id="wifi mask" />
                        </mask>
                        <g mask={isAndroidPhoneAndDark ? "url(#mask0_382_903)" : "url(#mask0_382_961)"}>
                          <path clipRule="evenodd" d={svgPaths.p39e1600} fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillOpacity={isAndroidPhoneAndDark ? "0.2" : "0.1"} fillRule="evenodd" id="Shape" />
                          <path clipRule="evenodd" d={svgPaths.p19081100} fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillRule="evenodd" id="Shape_2" />
                          <path clipRule="evenodd" d={svgPaths.p11728070} fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillRule="evenodd" id="Shape_3" />
                          <path clipRule="evenodd" d={svgPaths.p2115e740} fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillRule="evenodd" id="Oval" />
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="relative shrink-0 size-[12px]" data-name="reception">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                      <g id="reception">
                        <mask height="12" id={isAndroidPhoneAndDark ? "mask0_382_939" : "mask0_382_924"} maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="12" x="0" y="0">
                          <path clipRule="evenodd" d="M12 12V0L0 12H12Z" fill="var(--fill-0, white)" fillRule="evenodd" id="reception mask" />
                        </mask>
                        <g mask={isAndroidPhoneAndDark ? "url(#mask0_382_939)" : "url(#mask0_382_924)"}>
                          <path clipRule="evenodd" d="M9 0V12H12V0H9Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillOpacity={isAndroidPhoneAndDark ? "0.2" : "0.1"} fillRule="evenodd" id="Rectangle-path" />
                          <path clipRule="evenodd" d="M6 0V12H9V0H6Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillOpacity={isAndroidPhoneAndDark ? "0.2" : "0.1"} fillRule="evenodd" id="Rectangle-path_2" />
                          <path clipRule="evenodd" d="M3 0V12H6V0H3Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillRule="evenodd" id="Rectangle-path_3" />
                          <path clipRule="evenodd" d="M0 0V12H3V0H0Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillRule="evenodd" id="Rectangle-path_4" />
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Battery">
                    <p className={`font-["Roboto:Regular",sans-serif] font-normal leading-[normal] relative shrink-0 text-[13px] text-right whitespace-nowrap ${isAndroidPhoneAndDark ? "text-white" : "text-black"}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                      50%
                    </p>
                    <div className="h-[13px] relative shrink-0 w-[8px]" data-name="battery">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
                        <g id="battery">
                          <mask height="13" id={isAndroidPhoneAndDark ? "mask0_382_931" : "mask0_382_916"} maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="8" x="0" y="0">
                            <path clipRule="evenodd" d={svgPaths.p2f7e0200} fill="var(--fill-0, white)" fillRule="evenodd" id="battery mask" />
                          </mask>
                          <g mask={isAndroidPhoneAndDark ? "url(#mask0_382_931)" : "url(#mask0_382_916)"}>
                            <path clipRule="evenodd" d="M0 10V13H8V10H0Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillRule="evenodd" id="Rectangle-path" />
                            <path clipRule="evenodd" d="M0 7V10H8V7H0Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillRule="evenodd" id="Rectangle-path_2" />
                            <path clipRule="evenodd" d="M0 4V7H8V4H0Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillOpacity={isAndroidPhoneAndDark ? "0.2" : "0.1"} fillRule="evenodd" id="Rectangle-path_3" />
                            <path clipRule="evenodd" d="M0 1V4H8V1H0Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillOpacity={isAndroidPhoneAndDark ? "0.2" : "0.1"} fillRule="evenodd" id="Rectangle-path_4" />
                            <path clipRule="evenodd" d="M2 0V1H6V0H2Z" fill={isAndroidPhoneAndDark ? "var(--fill-0, white)" : "var(--fill-0, black)"} fillOpacity={isAndroidPhoneAndDark ? "0.2" : "0.1"} fillRule="evenodd" id="Rectangle-path_5" />
                          </g>
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {so === "Android Phone" && theme === "Light" && showBrowser && (
          <BrowserBarMobileBrowserBarAndroidChrome additionalClassNames="bg-white">
            <BrowserBarMobileHome>
              <path d={svgPaths.p76fe00} fill="var(--fill-0, #3D4043)" id="Union" />
            </BrowserBarMobileHome>
            <BrowserBarMobileSearchbar additionalClassNames="bg-[#f1f2f6]">
              <BrowserBarMobileVector>
                <path d={svgPaths.p3fced00} fill="var(--fill-0, #1E1E1E)" id="Vector" />
              </BrowserBarMobileVector>
              <BrowserBarMobileHelper additionalClassNames="text-[#1e1e1e]">{url}</BrowserBarMobileHelper>
            </BrowserBarMobileSearchbar>
            <BrowserBarMobileChromeTabs>
              <g clipPath="url(#clip0_382_987)" id="Chrome Tabs">
                <g id="Vector" />
                <path d={svgPaths.p3a422a80} fill="var(--fill-0, #3D4043)" id="Union" />
              </g>
              <defs>
                <clipPath id="clip0_382_987">
                  <rect fill="white" height="22" width="21.12" />
                </clipPath>
              </defs>
            </BrowserBarMobileChromeTabs>
            <BrowserBarMobileMoreMenu>
              <g clipPath="url(#clip0_382_1008)" id="More-menu">
                <g id="Vector" />
                <path d={svgPaths.p3fdba000} fill="var(--fill-0, #3D4043)" id="Vector_2" />
              </g>
              <defs>
                <clipPath id="clip0_382_1008">
                  <rect fill="white" height="24" width="24" />
                </clipPath>
              </defs>
            </BrowserBarMobileMoreMenu>
          </BrowserBarMobileBrowserBarAndroidChrome>
        )}
        {isAndroidPhoneAndDark && showBrowser && (
          <BrowserBarMobileBrowserBarAndroidChrome additionalClassNames="bg-[#1e1e1e]">
            <BrowserBarMobileHome>
              <path d={svgPaths.p76fe00} fill="var(--fill-0, white)" id="Union" />
            </BrowserBarMobileHome>
            <BrowserBarMobileSearchbar additionalClassNames="bg-[#1e1e1e]">
              <BrowserBarMobileVector>
                <path d={svgPaths.p3fced00} fill="var(--fill-0, white)" id="Vector" />
              </BrowserBarMobileVector>
              <BrowserBarMobileHelper additionalClassNames="text-white">{url}</BrowserBarMobileHelper>
            </BrowserBarMobileSearchbar>
            <BrowserBarMobileChromeTabs>
              <g clipPath="url(#clip0_382_981)" id="Chrome Tabs">
                <g id="Vector" />
                <path d={svgPaths.p3a422a80} fill="var(--fill-0, white)" id="Union" />
              </g>
              <defs>
                <clipPath id="clip0_382_981">
                  <rect fill="white" height="22" width="21.12" />
                </clipPath>
              </defs>
            </BrowserBarMobileChromeTabs>
            <BrowserBarMobileMoreMenu>
              <g clipPath="url(#clip0_382_977)" id="More-menu">
                <g id="Vector" />
                <path d={svgPaths.p3fdba000} fill="var(--fill-0, white)" id="Vector_2" />
              </g>
              <defs>
                <clipPath id="clip0_382_977">
                  <rect fill="white" height="24" width="24" />
                </clipPath>
              </defs>
            </BrowserBarMobileMoreMenu>
          </BrowserBarMobileBrowserBarAndroidChrome>
        )}
      </div>
      {isAndroidPhoneAndIsLightOrDark && <div aria-hidden="true" className={`absolute border-b border-solid inset-0 pointer-events-none shadow-[0px_1px_4px_0px_rgba(0,0,0,0.1)] ${isAndroidPhoneAndDark ? "border-[#606060]" : "border-[#f1f2f6]"}`} />}
    </div>
  );
}

export default function Lg() {
  return (
    <div className="bg-[#f7f8fb] overflow-clip relative rounded-[24px] size-full" data-name="LG 1304">
      <BrowserBarMobile className="absolute h-[93.096px] left-[-3px] top-0 w-[1283px]" url="pos.bold.co" />
      <div className="absolute content-stretch flex flex-col gap-[40px] items-center left-[128px] top-[104px] w-[589px]" data-name="Pago">
        <div className="content-center flex flex-wrap gap-[465px] items-center justify-end relative shrink-0 w-full">
          <div className="h-[31px] relative shrink-0 w-[71px]" data-name="logotipo/bold">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 71.0066 31">
              <g id="logotipo/bold">
                <path d={svgPaths.p26322370} fill="url(#paint0_linear_382_842)" id="Vector" />
              </g>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_382_842" x1="71.0066" x2="-1.77164e-06" y1="15.5" y2="15.5">
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
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[32px] relative shrink-0 text-[#1e1e1e] text-[24px] w-[432px]">{`Inicia sesión `}</p>
          </div>
          <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Info card">
            <div className="relative shrink-0 w-full" data-name="Text inputs">
              <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
                <AtomTextInputLabelsText text="Correo electrónico" />
                <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name=".atom/text_input_fields">
                  <div className="flex flex-row items-center justify-end size-full">
                    <div className="content-stretch flex gap-[12px] items-center justify-end px-[12px] py-[16px] relative w-full">
                      <AtomTextInputLabelsText1 text="ej: correo@gmail.com" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
              <div className="col-1 ml-0 mt-0 relative row-1 w-[589px]" data-name="Text inputs">
                <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
                  <AtomTextInputLabelsText text="Contraseña" />
                  <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name=".atom/text_input_fields">
                    <div className="flex flex-row items-center justify-end size-full">
                      <div className="content-stretch flex gap-[12px] items-center justify-end p-[12px] relative w-full">
                        <AtomTextInputLabelsText1 text="Escribe tu contraseña" />
                        <div className="relative shrink-0 size-[24px]" data-name="icon/ic_not_view">
                          <div className="absolute inset-[15.27%_3.76%]" data-name="Vector">
                            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.1936 16.67">
                              <path clipRule="evenodd" d={svgPaths.p30044600} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-1 flex flex-col font-['Montserrat:Regular',sans-serif] font-normal h-[27px] justify-center ml-0 mt-[84px] relative row-1 text-[#606060] text-[12px] w-[589px]">
                <p className="whitespace-pre-wrap">
                  <span className="leading-[normal]">{`¿Olvidaste tu contraseña?  `}</span>
                  <span className="[text-decoration-skip-ink:none] decoration-solid leading-[normal] text-[#121e6c] underline">Recuperala aquí</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[22px] items-start relative shrink-0 w-full">
          <div className="bg-[#f48990] relative rounded-[32px] shrink-0 w-[241px]" data-name="WEB Button">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[12px] items-center justify-center px-[24px] py-[12px] relative w-full">
                <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Iniciar sesión</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal h-[27px] justify-center leading-[0] relative shrink-0 text-[#606060] text-[12px] w-[589px]">
            <p className="whitespace-pre-wrap">
              <span className="leading-[normal]">{`¿Aún no tienes cuenta Bold POS?  `}</span>
              <span className="[text-decoration-skip-ink:none] decoration-solid leading-[normal] text-[#121e6c] underline">Crea tu cuenta</span>
            </p>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col items-start left-[calc(66.67%-29.33px)] top-[125px] w-[466px]" data-name="Purchase">
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
          <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1" data-name="Mask group">
            <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
              <div className="col-1 h-[547px] ml-0 mt-0 relative row-1 w-[614.071px]" data-name="MockPOSMObileTablet 1">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[107.9%] left-[-4.35%] max-w-none top-[-3.54%] w-[166.23%]" src={imgMockPosmObileTablet1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}