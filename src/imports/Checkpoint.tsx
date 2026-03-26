import clsx from "clsx";
import svgPaths from "./svg-dd539ft0qc";
import imgFavicon from "figma:asset/0c96ccfbda7bda53f39c1437cf5bb8dbdf5b6a60.png";
import imgRectangle from "figma:asset/93a2b673c1e7fa21a68c0a4396af2f892c21530d.png";
import imgRectangle1 from "figma:asset/f5af32607e8a76ef24d18725db5489f13901fb2d.png";
import imgCanon9571 from "figma:asset/70084587885ed7df629efff5badf0b5ecd91b1b5.png";
import imgObBacl1 from "figma:asset/831363ae4f2b1254d1cd13dc70709452d1f84bde.png";
import { imgCanon9570 } from "./svg-5fnu1";

function BackgroundImage({ children }: React.PropsWithChildren<{}>) {
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

export default function Checkpoint() {
  return (
    <div className="relative size-full" data-name="Checkpoint" style={{ backgroundImage: "linear-gradient(90deg, rgba(247, 248, 251, 0.2) 0%, rgba(247, 248, 251, 0.2) 100%), linear-gradient(123.413deg, rgba(8, 14, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 51.571%, rgba(8, 14, 255, 0.2) 101.2%), linear-gradient(90deg, rgb(247, 248, 251) 0%, rgb(247, 248, 251) 100%)" }}>
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
              <BackgroundImage>
                <g id="Icon - More">
                  <path clipRule="evenodd" d={svgPaths.p35109ec0} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage>
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
              <BackgroundImage>
                <g id="Icon - Favorite">
                  <path clipRule="evenodd" d={svgPaths.p127de900} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage>
            </div>
            <div className="-translate-y-1/2 absolute content-stretch flex gap-[15px] items-start left-[12px] top-1/2" data-name="Left Locked Icons">
              <BackgroundImage>
                <g id="Back">
                  <path clipRule="evenodd" d={svgPaths.p18d60780} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage>
              <BackgroundImage>
                <g id="Forward">
                  <path clipRule="evenodd" d={svgPaths.p245be700} fill="var(--fill-0, #BABCBE)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage>
              <BackgroundImage>
                <g id="Refresh">
                  <path clipRule="evenodd" d={svgPaths.p6e12800} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
                </g>
              </BackgroundImage>
              <BackgroundImage>
                <g id="Home">
                  <path d={svgPaths.p38af0f40} fill="var(--fill-0, #5F6368)" id="Container" />
                </g>
              </BackgroundImage>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[40px] h-[779px] items-center left-0 top-[80px] w-[1280px]" data-name="Content">
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
        <div className="flex-[1_0_0] min-h-px min-w-px relative w-[648px]" data-name="Body">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[40px] items-center px-[16px] py-[32px] relative size-full">
              <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Mask group">
                <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
                  <div className="col-1 h-[336.95px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_-0.002px] mask-size-[313.066px_336.949px] ml-0 mt-0 relative rounded-[15.492px] row-1 w-[313.066px]" data-name="Canon-9570" style={{ maskImage: `url('${imgCanon9570}')` }}>
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[15.492px] size-full" src={imgCanon9571} />
                  </div>
                  <div className="col-1 h-[261.427px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_-75.525px] mask-size-[313.066px_336.949px] ml-0 mt-[75.52px] relative row-1 w-[313.066px]" data-name="[OB]-bacl 1" style={{ maskImage: `url('${imgCanon9570}')` }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img alt="" className="absolute h-[166.97%] left-[-0.81%] max-w-none top-[-56.6%] w-[136.16%]" src={imgObBacl1} />
                    </div>
                  </div>
                  <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[88.43px] mt-[280.79px] place-items-start relative row-1" data-name="Icon">
                    <div className="col-1 h-[36.19px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-88.434px_-280.793px] mask-size-[313.066px_336.949px] ml-0 mt-0 relative row-1 w-[135.711px]" data-name="Union" style={{ maskImage: `url('${imgCanon9570}')` }}>
                      <div className="absolute inset-[-1.78%_-5.23%_-37.46%_-5.23%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 149.912 50.3906">
                          <g data-figma-bg-blur-radius="2.90474" filter="url(#filter0_di_404_3012)" id="Union">
                            <path d={svgPaths.p391fd000} fill="url(#paint0_linear_404_3012)" fillOpacity="0.6" shapeRendering="crispEdges" />
                            <path d={svgPaths.p391fd000} fill="var(--fill-1, white)" fillOpacity="0.4" shapeRendering="crispEdges" />
                          </g>
                          <defs>
                            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="52.6498" id="filter0_di_404_3012" width="149.912" x="0" y="-2.25924">
                              <feFlood floodOpacity="0" result="BackgroundImageFix" />
                              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                              <feOffset dy="6.45498" />
                              <feGaussianBlur stdDeviation="3.55024" />
                              <feComposite in2="hardAlpha" operator="out" />
                              <feColorMatrix type="matrix" values="0 0 0 0 0.0705882 0 0 0 0 0.117647 0 0 0 0 0.423529 0 0 0 0.1 0" />
                              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_404_3012" />
                              <feBlend in="SourceGraphic" in2="effect1_dropShadow_404_3012" mode="normal" result="shape" />
                              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                              <feOffset dx="0.645498" dy="0.645498" />
                              <feGaussianBlur stdDeviation="5.19626" />
                              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                              <feColorMatrix type="matrix" values="0 0 0 0 0.0705882 0 0 0 0 0.117647 0 0 0 0 0.423529 0 0 0 0.25 0" />
                              <feBlend in2="shape" mode="normal" result="effect2_innerShadow_404_3012" />
                            </filter>
                            <clipPath id="bgblur_0_404_3012_clip_path" transform="translate(0 2.25924)">
                              <path d={svgPaths.p391fd000} />
                            </clipPath>
                            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_404_3012" x1="17.7928" x2="123.894" y1="4.75794" y2="28.1989">
                              <stop stopColor="#080EFF" stopOpacity="0.1" />
                              <stop offset="0.5" stopColor="white" stopOpacity="0.5" />
                              <stop offset="1" stopColor="#080EFF" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="col-1 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-197.824px_-290.662px] mask-size-[313.066px_336.949px] ml-[109.39px] mt-[9.87px] relative row-1 size-[16.45px]" data-name="icon/ic_people" style={{ maskImage: `url('${imgCanon9570}')` }}>
                      <div className="absolute inset-[8.48%_11.83%]" data-name="Vector">
                        <div className="absolute inset-[-1.18%_-1.29%_-1.18%_-1.28%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8818 13.9829">
                            <g id="Vector">
                              <path clipRule="evenodd" d={svgPaths.p15525100} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                              <path clipRule="evenodd" d={svgPaths.pecfa400} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                              <path clipRule="evenodd" d={svgPaths.p15525100} fillRule="evenodd" stroke="var(--stroke-0, #121E6C)" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="0.322749" />
                              <path clipRule="evenodd" d={svgPaths.pecfa400} fillRule="evenodd" stroke="var(--stroke-0, #121E6C)" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="0.322749" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="col-1 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-96.66px_-289.018px] mask-size-[313.066px_336.949px] ml-[8.22px] mt-[8.23px] relative row-1 size-[19.74px]" data-name="icon/ic_security" style={{ maskImage: `url('${imgCanon9570}')` }}>
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.7397 19.7397">
                        <g id="icon/ic_security">
                          <path clipRule="evenodd" d={svgPaths.p3d6b1b80} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector" />
                          <path d={svgPaths.p3fa28700} id="Ellipse 107" stroke="var(--stroke-0, #121E6C)" strokeWidth="0.968247" />
                          <path d={svgPaths.p1c19d480} id="Vector 20" stroke="var(--stroke-0, #121E6C)" strokeLinecap="round" strokeWidth="0.968247" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] items-start justify-center min-h-px min-w-px relative">
                <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#1e1e1e] text-[12px] whitespace-nowrap">
                  <p className="leading-[16px]">Paso 1/4</p>
                </div>
                <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
                  <p className="font-['Montserrat:Bold',sans-serif] font-bold leading-[24px] relative shrink-0 text-[#1f2a74] text-[20px] w-full">Verifica tu identidad</p>
                  <p className="font-['Montserrat:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#1e1e1e] text-[0px] text-[14px] w-full">
                    <span className="leading-[20px]">{`Protegemos tu información y garantizamos que solo tú puedas usar Bold. `}</span>
                    <span className="font-['Montserrat:SemiBold',sans-serif] font-semibold leading-[20px]">Ten tu documento a la mano.</span>
                  </p>
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
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_16.1px_0px_rgba(18,30,108,0.1)]" />
    </div>
  );
}