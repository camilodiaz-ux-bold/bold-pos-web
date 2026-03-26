import clsx from "clsx";
import svgPaths from "./svg-5ecg1jdd6d";
import imgFavicon from "figma:asset/0c96ccfbda7bda53f39c1437cf5bb8dbdf5b6a60.png";
import imgRectangle from "figma:asset/93a2b673c1e7fa21a68c0a4396af2f892c21530d.png";
import imgRectangle1 from "figma:asset/f5af32607e8a76ef24d18725db5489f13901fb2d.png";
type AtomTextInputFieldsBackgroundImageProps = {
  text: string;
};

function AtomTextInputFieldsBackgroundImage({ children, text }: React.PropsWithChildren<AtomTextInputFieldsBackgroundImageProps>) {
  return (
    <div className="bg-white h-[40px] relative rounded-[12px] shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[12px] pr-[8px] py-[12px] relative size-full">
          <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
            <div className="absolute flex flex-col font-['Montserrat:Medium',sans-serif] font-medium inset-0 justify-center leading-[0] text-[#1e1e1e] text-[14px]">
              <p className="leading-[20px]">{text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterAtomProgressBarBackgroundImage() {
  return (
    <div className="bg-[#d2d4e1] flex-[1_0_0] min-h-px min-w-px relative rounded-[100px]">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center pr-[62px] relative w-full">
          <div className="bg-[rgba(255,255,255,0)] h-[2px] rounded-[100px] shrink-0 w-full" data-name="Bar indicator" />
        </div>
      </div>
    </div>
  );
}
type FooterBackgroundImageProps = {
  additionalClassNames?: string;
};

function FooterBackgroundImage({ additionalClassNames = "" }: FooterBackgroundImageProps) {
  return (
    <div className={clsx("content-stretch flex flex-col items-start justify-center relative w-full", additionalClassNames)}>
      <div className="bg-[#ff2947] h-[2px] rounded-[100px] shrink-0 w-full" data-name="Bar indicator" />
    </div>
  );
}
type Body1AtomTextInputLabelsBackgroundImageAndTextProps = {
  text: string;
};

function Body1AtomTextInputLabelsBackgroundImageAndText({ text }: Body1AtomTextInputLabelsBackgroundImageAndTextProps) {
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
type IconIcControlsProps = {
  className?: string;
  status?: "Default" | "Selected";
  type?: "Add" | "Less" | "Check" | "Close" | "Radiobutton" | "Checkbox";
};

function IconIcControls({ className, status = "Selected", type = "Less" }: IconIcControlsProps) {
  const isDefaultAndAdd = status === "Default" && type === "Add";
  const isDefaultAndCheck = status === "Default" && type === "Check";
  const isDefaultAndCheckbox = status === "Default" && type === "Checkbox";
  const isDefaultAndClose = status === "Default" && type === "Close";
  const isDefaultAndIsAddOrCheckOrClose = status === "Default" && ["Add", "Check", "Close"].includes(type);
  const isDefaultAndLess = status === "Default" && type === "Less";
  const isDefaultAndRadiobutton = status === "Default" && type === "Radiobutton";
  const isSelectedAndAdd = status === "Selected" && type === "Add";
  const isSelectedAndCheck = status === "Selected" && type === "Check";
  const isSelectedAndCheckbox = status === "Selected" && type === "Checkbox";
  const isSelectedAndClose = status === "Selected" && type === "Close";
  const isSelectedAndLess = status === "Selected" && type === "Less";
  const isSelectedAndRadiobutton = status === "Selected" && type === "Radiobutton";
  return (
    <div className={className || "relative size-[24px]"}>
      {(isSelectedAndAdd || isDefaultAndAdd || isDefaultAndCheck || isSelectedAndCheck || isDefaultAndClose || isSelectedAndRadiobutton || isDefaultAndRadiobutton || isSelectedAndCheckbox) && (
        <div className={`absolute ${isSelectedAndRadiobutton || isDefaultAndRadiobutton || isSelectedAndCheckbox ? "inset-[8.33%]" : "inset-[4.17%]"}`} data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox={isSelectedAndRadiobutton || isDefaultAndRadiobutton || isSelectedAndCheckbox ? "0 0 20 20" : "0 0 22 22"}>
            {(isSelectedAndAdd || isDefaultAndAdd || isDefaultAndCheck || isSelectedAndCheck || isDefaultAndClose) && <circle cx="11" cy="11" fill={isDefaultAndIsAddOrCheckOrClose ? "var(--fill-0, #FEF1F3)" : "var(--fill-0, #FF2947)"} id="Vector" r={isDefaultAndIsAddOrCheckOrClose ? "10.5" : "11"} stroke={isDefaultAndIsAddOrCheckOrClose ? "var(--stroke-0, #FF2947)" : undefined} />}
            {status === "Selected" && ["Radiobutton", "Checkbox"].includes(type) && (
              <g id="Vector">
                <path d={isSelectedAndCheckbox ? svgPaths.p2cb94280 : svgPaths.p28e48700} fill={isSelectedAndCheckbox ? "#FF2947" : "white"} />
                <path clipRule="evenodd" d={isSelectedAndCheckbox ? svgPaths.p76675c0 : svgPaths.p19721b2} fill={isSelectedAndCheckbox ? "var(--fill-0, white)" : "var(--fill-0, #FF2947)"} fillRule="evenodd" />
                {isSelectedAndRadiobutton && <path d={svgPaths.p37d63500} fill="var(--fill-0, #FF2947)" />}
              </g>
            )}
            {isDefaultAndRadiobutton && <path d={svgPaths.p1d1aa640} fill="var(--fill-0, white)" id="Vector" stroke="var(--stroke-0, #121E6C)" />}
          </svg>
        </div>
      )}
      {(isSelectedAndClose || isDefaultAndClose || isDefaultAndCheckbox) && (
        <div className={`absolute ${isDefaultAndCheckbox ? "flex inset-[8.33%] items-center justify-center" : isDefaultAndClose ? "flex inset-[18.79%] items-center justify-center" : "inset-[4.17%]"}`}>
          {status === "Default" && ["Close", "Checkbox"].includes(type) && (
            <div className={`flex-none ${isDefaultAndCheckbox ? "-scale-y-100 rotate-180 size-[20px]" : "rotate-45 size-[10.593px]"}`}>
              {isDefaultAndClose && (
                <div className="relative size-full" data-name="Vector (Stroke)">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5926 10.5926">
                    <path clipRule="evenodd" d={svgPaths.p20f7ab80} fill="var(--fill-0, #FF2947)" fillRule="evenodd" id="Vector (Stroke)" />
                  </svg>
                </div>
              )}
              {isDefaultAndCheckbox && (
                <div className="relative size-full" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                    <path d={svgPaths.p23478671} fill="var(--fill-0, white)" id="Vector" stroke="var(--stroke-0, #121E6C)" />
                  </svg>
                </div>
              )}
            </div>
          )}
          {isSelectedAndClose && (
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
              <circle cx="11" cy="11" fill="var(--fill-0, #EE424E)" id="Ellipse 3" r="11" />
            </svg>
          )}
        </div>
      )}
      {type === "Less" && ["Default", "Selected"].includes(status) && (
        <div className="absolute inset-[4.17%]" data-name="less">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
            <g id="less">
              {isDefaultAndLess && (
                <>
                  <path d={svgPaths.p91c45f0} fill="var(--fill-0, #FEF1F3)" id="Ellipse 3" />
                  <path clipRule="evenodd" d={svgPaths.p2bebf780} fill="var(--fill-0, #FF2947)" fillRule="evenodd" id="Ellipse 3 (Stroke)" />
                  <path clipRule="evenodd" d={svgPaths.p7a6c800} fill="var(--fill-0, #FF2947)" fillRule="evenodd" id="Vector 5 (Stroke)" />
                </>
              )}
              {isSelectedAndLess && (
                <>
                  <g id="Vector">
                    <path d={svgPaths.p91c45f0} fill="#FF2947" />
                    <path clipRule="evenodd" d={svgPaths.p2bebf780} fill="var(--fill-0, #FF2947)" fillRule="evenodd" />
                  </g>
                  <path clipRule="evenodd" d={svgPaths.p7a6c800} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
                </>
              )}
            </g>
          </svg>
        </div>
      )}
      {type === "Add" && ["Selected", "Default"].includes(status) && (
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5926 10.5926">
            <path clipRule="evenodd" d={svgPaths.p20f7ab80} fill={isDefaultAndAdd ? "var(--fill-0, #FF2947)" : "var(--fill-0, white)"} fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      )}
      {type === "Check" && ["Default", "Selected"].includes(status) && (
        <div className="absolute inset-1/4" data-name="icon/ic_check /Bold">
          <div className="absolute inset-[21.99%_7.52%_22.35%_4.38%]" data-name="Vector (Stroke)">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.1451 14.11">
              <path clipRule="evenodd" d={svgPaths.p12ba3cc0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector (Stroke)" />
            </svg>
          </div>
        </div>
      )}
      {isSelectedAndClose && (
        <div className="absolute flex inset-[18.79%] items-center justify-center">
          <div className="flex-none rotate-45 size-[10.593px]">
            <div className="relative size-full" data-name="Vector (Stroke)">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5926 10.5926">
                <path clipRule="evenodd" d={svgPaths.p20f7ab80} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector (Stroke)" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NombreCompleto() {
  return (
    <div className="relative size-full" data-name="Nombre completo" style={{ backgroundImage: "linear-gradient(90deg, rgba(247, 248, 251, 0.2) 0%, rgba(247, 248, 251, 0.2) 100%), linear-gradient(123.413deg, rgba(8, 14, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 51.571%, rgba(8, 14, 255, 0.2) 101.2%), linear-gradient(90deg, rgb(247, 248, 251) 0%, rgb(247, 248, 251) 100%)" }}>
      <div className="absolute left-0 top-0 w-[1280px]" data-name="Browser Bar / Desktop">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="bg-[#dee1e6] h-[42px] relative shrink-0 w-full" data-name="Toolbar - Browser Controls">
            <div className="absolute content-stretch flex isolate items-center left-[78px] top-[8px]" data-name="Tabs">
              <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 z-[1]" data-name="End Tab">
                <div className="content-stretch flex items-end justify-center relative shrink-0" data-name="Tab active">
                  <div className="h-[8px] relative shrink-0 w-[6px]" data-name="Curve L">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 8">
                      <path clipRule="evenodd" d={svgPaths.p2ea0ec00} fill="var(--fill-0, white)" fillRule="evenodd" id="Curve L" />
                    </svg>
                  </div>
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
                      <div className="h-[8px] relative w-[6px]" data-name="Curve R">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 8">
                          <path clipRule="evenodd" d={svgPaths.p2ea0ec00} fill="var(--fill-0, white)" fillRule="evenodd" id="Curve R" />
                        </svg>
                      </div>
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
              <div className="relative shrink-0 size-[16px]" data-name="Icon - More">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <g id="Icon - More">
                    <path clipRule="evenodd" d={svgPaths.p35109ec0} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                  </g>
                </svg>
              </div>
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
              <div className="relative shrink-0 size-[16px]" data-name="Icon - Favorite">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <g id="Icon - Favorite">
                    <path clipRule="evenodd" d={svgPaths.p127de900} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute content-stretch flex gap-[15px] items-start left-[12px] top-1/2" data-name="Left Locked Icons">
              <div className="relative shrink-0 size-[16px]" data-name="Back">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <g id="Back">
                    <path clipRule="evenodd" d={svgPaths.p18d60780} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                  </g>
                </svg>
              </div>
              <div className="relative shrink-0 size-[16px]" data-name="Forward">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <g id="Forward">
                    <path clipRule="evenodd" d={svgPaths.p245be700} fill="var(--fill-0, #BABCBE)" fillRule="evenodd" id="Container" />
                  </g>
                </svg>
              </div>
              <div className="relative shrink-0 size-[16px]" data-name="Refresh">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <g id="Refresh">
                    <path clipRule="evenodd" d={svgPaths.p6e12800} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                  </g>
                </svg>
              </div>
              <div className="relative shrink-0 size-[16px]" data-name="Home">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <g id="Home">
                    <path d={svgPaths.p38af0f40} fill="var(--fill-0, #5F6368)" id="Container" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[24px] h-[779px] items-center justify-center left-0 top-[80px] w-[1280px]">
        <div className="content-stretch flex items-center justify-between px-[24px] py-[20px] relative shrink-0 w-[1280px]" data-name="Header">
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
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[48px] items-center justify-center min-h-px min-w-px relative w-[484px]" data-name="Body">
          <div className="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0 w-[484px]" data-name="WEB Panel / Navigation Header">
            <p className="font-['Montserrat:Bold',sans-serif] font-bold h-[20px] leading-[24px] relative shrink-0 text-[#121e6c] text-[20px] w-full">¿Cuál es tu dirección de contacto?</p>
            <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1e1e1e] text-[14px] w-full">
              <p className="leading-[20px]">{`Si llegas a necesitar un producto físico, lo enviaremos a esta dirección. `}</p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Body">
            <div className="relative shrink-0 w-full" data-name="Forms">
              <div className="content-stretch flex flex-col gap-[32px] items-start relative w-full">
                <div className="relative shrink-0 w-full" data-name="Text inputs">
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
                    <Body1AtomTextInputLabelsBackgroundImageAndText text="Ciudad" />
                    <div className="bg-white h-[40px] relative rounded-[12px] shrink-0 w-full" data-name=".atom/text_input_fields">
                      <div className="flex flex-row items-center size-full">
                        <div className="content-stretch flex gap-[12px] items-center px-[12px] py-[8px] relative size-full">
                          <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
                            <div className="absolute flex flex-col font-['Montserrat:Medium',sans-serif] font-medium inset-0 justify-center leading-[0] text-[#1e1e1e] text-[14px]">
                              <p className="leading-[20px]">{"Bogotá D.C."}</p>
                            </div>
                          </div>
                          <div className="relative shrink-0 size-[24px]" data-name="icon/ic_chevron">
                            <div className="absolute bottom-[26.39%] left-[8.33%] right-[8.33%] top-1/4" data-name="Vector 2 (Stroke)">
                              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 11.6667">
                                <path clipRule="evenodd" d={svgPaths.p32a7b500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector 2 (Stroke)" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative shrink-0 w-full" data-name="Text inputs">
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
                    <Body1AtomTextInputLabelsBackgroundImageAndText text="Dirección" />
                    <AtomTextInputFieldsBackgroundImage text="Calle 169 #16c - 70" />
                  </div>
                </div>
                <div className="relative shrink-0 w-full" data-name="Text inputs">
                  <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
                    <Body1AtomTextInputLabelsBackgroundImageAndText text="Detalles de la dirección" />
                    <AtomTextInputFieldsBackgroundImage text="Torre 6 - Apto 501" />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative shrink-0 w-full" data-name="APP Checkbox">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex gap-[8px] items-center relative w-full">
                  <IconIcControls className="relative shrink-0 size-[24px]" status="Default" type="Checkbox" />
                  <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
                    <p className="leading-[20px]">La dirección no tiene información adicional.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start pb-[20px] px-[24px] relative shrink-0 w-[1280px]" data-name="Footer">
          <div className="relative shrink-0 w-full" data-name="Progress / Split bar">
            <div className="content-stretch flex gap-[8px] items-start relative w-full">
              <div className="bg-[#d2d4e1] flex-[1_0_0] min-h-px min-w-px relative rounded-[100px]" data-name=".atom/progress_bar">
                <div className="flex flex-col justify-center size-full">
                  <FooterBackgroundImage />
                </div>
              </div>
              <div className="bg-[#d2d4e1] flex-[1_0_0] min-h-px min-w-px relative rounded-[100px]" data-name=".atom/progress_bar">
                <div className="flex flex-col justify-center size-full">
                  <FooterBackgroundImage additionalClassNames="pr-[62px]" />
                </div>
              </div>
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
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_16.1px_0px_rgba(18,30,108,0.1)]" />
    </div>
  );
}