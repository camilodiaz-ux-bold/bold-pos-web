import clsx from "clsx";
import svgPaths from "./svg-q0shbad2n5";
import { imgGroup } from "./svg-77bgl";
import imgImage1 from "figma:asset/a1c33b4ceffb6ff280ec4e67b9b61923b4804095.png";
type TextProps = {
  text: string;
  text1: string;
};

function Text({ text, text1 }: TextProps) {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 text-[14px] w-full">
      <p className="font-['Montserrat:Semibold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#1e1e1e] w-full">{text}</p>
      <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#606060] w-full">
        <p className="leading-[20px]">{text1}</p>
      </div>
    </div>
  );
}
type ImageImageProps = {
  additionalClassNames?: string;
};

function ImageImage({ additionalClassNames = "" }: ImageImageProps) {
  return (
    <div className={clsx("col-1 mt-0 relative row-1 size-[115px]", additionalClassNames)}>
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
    </div>
  );
}
type BadgeGooglePlayProps = {
  className?: string;
  color?: "White" | "Black";
};

function BadgeGooglePlay({ className, color = "Black" }: BadgeGooglePlayProps) {
  const isBlack = color === "Black";
  const isWhite = color === "White";
  return (
    <div className={className || "h-[40px] relative w-[134.998px]"}>
      <div className="absolute contents inset-0" data-name="Clip path group">
        <div className="absolute contents inset-0" data-name="Group">
          <div className="absolute contents inset-0" data-name="Clip path group">
            <div className={`absolute inset-[0_0_-0.01%_0] ${isWhite ? "mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[134.998px_40px]" : "mask-position-[0px_0px,_0px_0px]"}`} data-name="Group" style={isWhite ? { maskImage: `url('${imgGroup}')` } : { maskImage: `url('${imgGroup}'), url('${imgGroup}')` }}>
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 135 40.0021">
                <g id="Group">
                  <path d={isWhite ? svgPaths.pf036a30 : svgPaths.p25f70100} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, #060000)"} id="Vector" />
                  <path d={isWhite ? svgPaths.p21ee5370 : svgPaths.pf036a30} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, #AEACA8)"} id="Vector_2" />
                  {isBlack && (
                    <>
                      <path d={svgPaths.p21ee5370} fill="var(--fill-0, white)" id="Vector_3" />
                      <path d={svgPaths.p31193b00} fill="var(--fill-0, #E63C27)" id="Vector_4" />
                      <path d={svgPaths.pc1bb400} fill="var(--fill-0, #F9C200)" id="Vector_5" />
                      <path d={svgPaths.p22216280} fill="var(--fill-0, #557ABD)" id="Vector_6" />
                      <path d={svgPaths.pd053580} fill="var(--fill-0, #0AA346)" id="Vector_7" />
                    </>
                  )}
                  {isWhite && (
                    <g id="Vector_3">
                      <path d={svgPaths.p2d6fe200} fill="black" />
                      <path clipRule="evenodd" d={svgPaths.p13565980} fill="var(--fill-0, white)" fillRule="evenodd" />
                      <path d={svgPaths.p18a55900} fill="black" />
                      <path clipRule="evenodd" d={svgPaths.p84aec20} fill="var(--fill-0, white)" fillRule="evenodd" />
                      <path d={svgPaths.p22216280} fill="black" />
                      <path clipRule="evenodd" d={svgPaths.pa381c20} fill="var(--fill-0, white)" fillRule="evenodd" />
                      <path d={svgPaths.p3fb09e80} fill="black" />
                      <path clipRule="evenodd" d={svgPaths.p31edfbf0} fill="var(--fill-0, white)" fillRule="evenodd" />
                    </g>
                  )}
                </g>
              </svg>
            </div>
          </div>
          <div className={`absolute inset-[16.91%_22.32%_66.81%_30.95%] ${isWhite ? "" : "mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-41.785px_-6.762px] mask-size-[134.998px_40px]"}`} data-name="Group" style={isBlack ? { maskImage: `url('${imgGroup}')` } : undefined}>
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63.0813 6.51168">
              <g id="Group">
                <path d={svgPaths.p3b552580} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector" />
                <path d={svgPaths.p3dcde100} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_2" />
                <path d={svgPaths.p790c500} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_3" />
                <path d={svgPaths.p14db0680} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_4" />
                <path d={svgPaths.pa635f80} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_5" />
                <path d={svgPaths.p178b1e00} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_6" />
                <path d={svgPaths.p1124b680} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_7" />
                <path d={svgPaths.p140aa000} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_8" />
                <path d={svgPaths.p31ff3780} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_9" />
                <path d={svgPaths.p26c85080} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_10" />
                <path d={svgPaths.p25a66800} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_11" />
                <path d={svgPaths.p2e84ce00} fill={isWhite ? "var(--fill-0, black)" : "var(--fill-0, white)"} id="Vector_12" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WebModal({ onClose }: { onClose?: () => void }) {
  return (
    <div className="bg-white content-stretch flex flex-col items-center relative rounded-[24px] shadow-[0px_8px_20px_0px_rgba(0,0,0,0.08)] size-full" data-name="WEB Modal">
      <div className="bg-[#f1f2f6] relative rounded-tl-[24px] rounded-tr-[24px] shrink-0 w-full" data-name="Header">
        <div className="flex flex-col items-center size-full">
          <div className="content-stretch flex flex-col gap-[24px] items-center pb-[32px] pt-[24px] px-[24px] relative w-full">
            <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 w-full">
              <div className="content-stretch flex items-center justify-end relative shrink-0 w-[68px]">
                <div className="shrink-0 size-[24px]" data-name="icon/ic_close/Bold/Small" />
              </div>
              <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] min-h-px min-w-px relative text-[#121e6c] text-[16px] text-center">
                <p className="leading-[20px]">Descarga la App Bold POS</p>
              </div>
              <div className="content-stretch flex items-center justify-end relative shrink-0 w-[68px]">
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Cerrar"
                >
                  <div className="relative shrink-0 size-[24px]" data-name="icon/ic_close/Bold/Small">
                    <div className="absolute inset-[15.63%_14.06%_15.62%_17.19%]" data-name="Union">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 16.5">
                        <path clipRule="evenodd" d={svgPaths.p25dc38a0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Union" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full">
              <div className="bg-white content-stretch flex flex-col gap-[45px] items-center justify-center p-[20px] relative rounded-[20px] shrink-0 w-[364px]">
                <div className="content-stretch flex flex-col items-start relative shrink-0">
                  <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
                      <div className="col-1 h-[35px] ml-0 mt-[133px] relative row-1 w-[115px]" data-name="badge/appstore">
                        <div className="absolute inset-[2.23%_0.66%]" data-name="Vector">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
                            <g id="Vector" />
                          </svg>
                        </div>
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 115 35">
                          <path d={svgPaths.p15267f00} fill="var(--fill-0, black)" id="Subtract" />
                        </svg>
                        <div className="absolute inset-[15.55%_75.14%_20.66%_9.48%]" data-name="Vector">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.6908 22.3288">
                            <path d={svgPaths.p17249400} fill="var(--fill-0, black)" id="Vector" />
                          </svg>
                        </div>
                        <div className="absolute inset-[45.01%_9.46%_11.49%_31.45%]" data-name="Group">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67.9534 15.2257">
                            <g id="Group">
                              <path d={svgPaths.p3d1d2000} fill="var(--fill-0, black)" id="Vector" />
                            </g>
                          </svg>
                        </div>
                        <div className="absolute inset-[16.39%_10.17%_66.14%_32.37%]" data-name="Group">
                          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 66.0801 6.11531">
                            <g id="Group">
                              <path d={svgPaths.p12c1400} fill="var(--fill-0, black)" id="Vector" />
                            </g>
                          </svg>
                        </div>
                      </div>
                      <ImageImage additionalClassNames="ml-[1.25px]" />
                    </div>
                    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[137.25px] mt-px place-items-start relative row-1">
                      <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
                        <BadgeGooglePlay className="col-1 h-[33.884px] ml-0 mt-[133px] overflow-clip relative row-1 w-[115px]" color="White" />
                        <ImageImage additionalClassNames="ml-[0.02px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal h-[27px] justify-center leading-[0] relative shrink-0 text-[#606060] text-[12px] text-center w-full">
                <p className="leading-[16px]">Escanea el QR y gestiona tu negocio desde el celular</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-full" data-name="Body">
        <div className="flex flex-col items-center size-full">
          <div className="content-stretch flex flex-col gap-[24px] items-center p-[24px] relative w-full">
            <div className="bg-white content-stretch flex gap-[20px] items-start relative rounded-[20px] shrink-0 w-[552px]" data-name="Features">
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative" data-name="Item">
                <div className="relative shrink-0 size-[24px]" data-name="icon/ic_hand_money">
                  <div className="absolute inset-[5.54%_3.98%]" data-name="Vector">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.0909 21.34">
                      <g id="Vector">
                        <path clipRule="evenodd" d={svgPaths.p2bda9c00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p2daad600} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.pdf1136} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p247c1cf0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p2538ae00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.pab6bf80} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p2e473b80} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      </g>
                    </svg>
                  </div>
                </div>
                <Text text="Tus ventas del día" text1="Recibe tu cierre diario automáticamente al final del día en tu celular." />
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative" data-name="Item">
                <div className="relative shrink-0 size-[24px]" data-name="icon/ic_automatic_billing">
                  <div className="absolute inset-[2.08%_2.67%]" data-name="Vector">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.7201 23">
                      <path clipRule="evenodd" d={svgPaths.p2e4e9400} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" id="Vector" />
                    </svg>
                  </div>
                </div>
                <Text text="Vende y factura" text1="Gestiona las ventas de tu negocio desde cualquier lugar." />
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative" data-name="Item">
                <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon/ic_charge_check">
                  <div className="absolute inset-[4.16%_5.73%_3.29%_8.33%]" data-name="Vector">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.6245 22.2124">
                      <g id="Vector">
                        <path clipRule="evenodd" d={svgPaths.p32ded180} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p2f51aa00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p35f54300} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                        <path clipRule="evenodd" d={svgPaths.p37468540} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                      </g>
                    </svg>
                  </div>
                </div>
                <Text text="Flujo de caja" text1="Conoce tus ingresos y gastos de 1 o más tiendas en tiempo real." />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative rounded-[24px] shrink-0 w-full" data-name="Footer">
        <div className="flex flex-col items-center justify-end size-full">
          <div className="content-stretch flex flex-col items-center justify-end p-[24px] relative w-full">
            <div className="relative shrink-0 w-full" data-name="WEB Button / Clustered">
              <div className="flex flex-row justify-center size-full">
                <div className="content-stretch flex gap-[8px] items-start justify-center relative w-full">
                  <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <div className="bg-[#ff2947] relative rounded-[32px] shrink-0" data-name="WEB Button">
                      <div className="flex flex-row items-center justify-center size-full">
                        <div className="content-stretch flex gap-[8px] items-center justify-center px-[20px] py-[12px] relative">
                          <p className="font-['Montserrat:SemiBold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Entendido</p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}