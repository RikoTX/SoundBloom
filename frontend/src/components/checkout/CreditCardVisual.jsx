import { CARD_COLOR_CLASS } from "../../utils/cardBrand";

const DEFAULT_NUMBER = "0123 4567 8910 1112";
const DEFAULT_NAME = "JOHN DOE";
const DEFAULT_EXPIRE = "01/28";
const DEFAULT_CVC = "985";

export default function CreditCardVisual({
  flipped,
  colorClass = "grey",
  number = DEFAULT_NUMBER,
  name = DEFAULT_NAME,
  expire = DEFAULT_EXPIRE,
  cvc = DEFAULT_CVC,
  brandBadge = null,
  onFlip,
}) {
  const light = CARD_COLOR_CLASS[colorClass] ?? "grey";
  const dark = `${light}dark`;

  return (
    <div
      className={`container preload ${flipped ? "" : ""}`}
      onClick={onFlip}
      onKeyDown={(e) => e.key === "Enter" && onFlip?.()}
      role="presentation"
    >
      <div className={`creditcard${flipped ? " flipped" : ""}`}>
        <div className="front">
          <div id="ccsingle">{brandBadge}</div>
          <svg
            version="1.1"
            id="cardfront"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 750 471"
            xmlSpace="preserve"
          >
            <g id="Front">
              <g id="CardBackground">
                <g id="Page-1_1_">
                  <g id="amex_1_">
                    <path
                      id="Rectangle-1_1_"
                      className={`lightcolor ${light}`}
                      d="M40,0h670c22.1,0,40,17.9,40,40v391c0,22.1-17.9,40-40,40H40c-22.1,0-40-17.9-40-40V40 C0,17.9,17.9,0,40,0z"
                    />
                  </g>
                </g>
                <path
                  className={`darkcolor ${dark}`}
                  d="M750,431V193.2c-217.6-57.5-556.4-13.5-750,24.9V431c0,22.1,17.9,40,40,40h670C732.1,471,750,453.1,750,431z"
                />
              </g>
              <text
                transform="matrix(1 0 0 1 60.106 295.0121)"
                className="st2 st3 st4"
              >
                {number || DEFAULT_NUMBER}
              </text>
              <text
                transform="matrix(1 0 0 1 54.1064 428.1723)"
                className="st2 st5 st6"
              >
                {(name || DEFAULT_NAME).toUpperCase()}
              </text>
              <text
                transform="matrix(1 0 0 1 54.1074 389.8793)"
                className="st7 st5 st8"
              >
                cardholder name
              </text>
              <text
                transform="matrix(1 0 0 1 479.7754 388.8793)"
                className="st7 st5 st8"
              >
                expiration
              </text>
              <text
                transform="matrix(1 0 0 1 65.1054 241.5)"
                className="st7 st5 st8"
              >
                card number
              </text>
              <g>
                <text
                  transform="matrix(1 0 0 1 574.4219 433.8095)"
                  className="st2 st5 st9"
                >
                  {expire || DEFAULT_EXPIRE}
                </text>
                <text
                  transform="matrix(1 0 0 1 479.3848 417.0097)"
                  className="st2 st10 st11"
                >
                  VALID
                </text>
                <text
                  transform="matrix(1 0 0 1 479.3848 435.6762)"
                  className="st2 st10 st11"
                >
                  THRU
                </text>
                <polygon
                  className="st2"
                  points="554.5,421 540.4,414.2 540.4,427.9"
                />
              </g>
              <g id="cchip">
                <path
                  className="st2"
                  d="M168.1,143.6H82.9c-10.2,0-18.5-8.3-18.5-18.5V74.9c0-10.2,8.3-18.5,18.5-18.5h85.3 c10.2,0,18.5,8.3,18.5,18.5v50.2C186.6,135.3,178.3,143.6,168.1,143.6z"
                />
                <path
                  className="st12"
                  d="M125.5,130.8c-10.2,0-18.5-8.3-18.5-18.5c0-4.6,1.7-8.9,4.7-12.3c-3-3.4-4.7-7.7-4.7-12.3 c0-10.2,8.3-18.5,18.5-18.5s18.5,8.3,18.5,18.5c0,4.6-1.7,8.9-4.7,12.3c3,3.4,4.7,7.7,4.7,12.3 C143.9,122.5,135.7,130.8,125.5,130.8z"
                />
              </g>
            </g>
          </svg>
        </div>
        <div className="back">
          <svg
            version="1.1"
            id="cardback"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 750 471"
            xmlSpace="preserve"
          >
            <g id="Back">
              <path
                className={`darkcolor ${dark}`}
                d="M40,0h670c22.1,0,40,17.9,40,40v391c0,22.1-17.9,40-40,40H40c-22.1,0-40-17.9-40-40V40 C0,17.9,17.9,0,40,0z"
              />
              <rect y="61.6" className="st2" width="750" height="78" />
              <path
                className="st3"
                d="M701.1,249.1H48.9c-3.3,0-6-2.7-6-6v-52.5c0-3.3,2.7-6,6-6h652.1c3.3,0,6,2.7,6,6v52.5 C707.1,246.4,704.4,249.1,701.1,249.1z"
              />
              <text
                transform="matrix(1 0 0 1 621.999 227.2734)"
                className="st6 st7"
              >
                {cvc || DEFAULT_CVC}
              </text>
              <text
                transform="matrix(1 0 0 1 518.083 280.0879)"
                className="st9 st6 st10"
              >
                security code
              </text>
              <text
                transform="matrix(1 0 0 1 59.5073 228.6099)"
                className="st12 st13"
              >
                {name || DEFAULT_NAME}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
