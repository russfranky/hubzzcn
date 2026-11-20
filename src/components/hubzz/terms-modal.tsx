import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export interface TermsModalProps {
  open: boolean
  onClose: () => void
  className?: string
}

/**
 * Terms of Use modal, ported from the Figma Make project
 * "Digital Merch Modal" (file 7w2KEWk6WBaOOaDQSjRd1S, TermsModal.tsx).
 *
 * The legal copy is carried over from the Figma source as-is,
 * including the sections the source itself abbreviates. The shell is
 * hubzzcn's Dialog with semantic tokens in place of the source hex
 * palette.
 */
export function TermsModal({ open, onClose, className }: TermsModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl",
          className
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border p-6">
          <DialogTitle className="text-xl font-bold">Terms of Use</DialogTitle>
        </div>

        <div className="space-y-6 overflow-y-auto p-6 text-sm leading-relaxed text-muted-foreground md:p-10 md:text-base">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-popover-foreground md:text-3xl">
              HUBZZ INC. TERMS OF USE
            </h1>
            <p className="font-semibold">Last updated: December 13, 2025</p>

            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="mb-2 font-bold text-popover-foreground">
                IF YOU ARE AN ENTERPRISE USER, YOUR USE OF THE PLATFORM (AND
                ASSOCIATED SERVICES) IS GOVERNED BY THE SERVICE AGREEMENT
                BETWEEN YOUR COMPANY AND HUBZZ INC.
              </p>
              <p className="font-bold text-popover-foreground">
                PLEASE READ THIS AGREEMENT CAREFULLY TO UNDERSTAND YOUR RIGHTS
                AND OBLIGATIONS. THIS AGREEMENT CONTAINS A MANDATORY ARBITRATION
                PROVISION AND CLASS ACTION WAIVER. PLEASE REVIEW SECTION 17. BY
                USING THE PLATFORM, YOU AGREE TO BE BOUND BY THIS AGREEMENT. IF
                YOU DO NOT AGREE (A) DO NOT USE THE PLATFORM; AND (B) DELETE OR
                DISABLE ANY DOWNLOADED COPY OF THE PLATFORM IN YOUR POSSESSION
                OR CONTROL.
              </p>
            </div>

            <p>
              These Terms of Use ("Agreement") is a legal agreement between
              Hubzz Inc. and/or one or more of its affiliates (collectively,
              "Hubzz" or "we") and You (an individual or entity) that governs
              Your access and use of the Platform. This Agreement is effective
              on the date You click to accept or when You begin use of the
              Platform, whichever event occurs first. You represent that You are
              lawfully able and have full legal authority to enter into this
              Agreement (e.g. are competent and of legal age and have full legal
              authority to bind the entity or company You represent). Your
              continued access to or use of the Platform following the posting
              of revised terms means that You accept and agree to any revised
              terms.
            </p>
          </div>

          <hr className="border-border" />

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              1. PLATFORM; ADDITIONAL TERMS
            </h3>

            <h4 className="font-semibold text-popover-foreground">
              a) Definition of Platform
            </h4>
            <p>
              The term "Platform" means Hubzz, including all associated media,
              printed or electronic documentation, content, tools, and
              functionality, all updates and support (if any), and the services
              described as follows:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                (i) <strong>Social Entertainment Platform</strong>: A
                browser-accessible and VR-compatible virtual world that enables
                users ("Users") to participate in immersive 3D experiences,
                attend events, create and customize avatars, own digital assets,
                and engage with communities in persistent shared spaces.
              </li>
              <li>
                (ii) <strong>Virtual Property and Spatial Assets</strong>:
                Allows Users to purchase, own, customize, and trade virtual real
                estate including Zones (64x64 tile land parcels), Properties
                (private spaces within Zones), and FlexEvent Spaces (rentable
                venues for events). These assets are represented as
                blockchain-based NFTs on the Somnia Network or other designated
                blockchain infrastructure.
              </li>
              <li>
                (iii) <strong>User-Generated Content</strong>: Allows Users to
                upload, create, and organize 2D or 3D model data, images,
                videos, avatars, virtual items, digital merchandise, spatial
                designs, event configurations, and any other content that can be
                displayed or used within the Platform ("Uploaded Content" or
                "User Content").
              </li>
              <li>
                (iv) <strong>Generated Content</strong>: Provides tools and
                systems for Users to generate, build, and customize spatial
                environments using the Zone Builder System, avatar creation
                tools, and other creative features provided by Hubzz ("Generated
                Content").
              </li>
              <li>
                (v) <strong>Events and Social Experiences</strong>: Facilitates
                live events including concerts, workshops, meetups, game nights,
                virtual conferences, and other scheduled interactive experiences
                within designated FlexEvent Spaces.
              </li>
              <li>
                (vi) <strong>Digital Economy</strong>: Implements an in-platform
                economy utilizing Hubzz Credits (HBC) as the primary soft
                currency, Experience Points (XP) as engagement rewards, and
                blockchain-based NFTs for ownership of virtual assets.
              </li>
            </ul>
            <p>
              To enable proper functioning of the Platform, the Platform stores
              Uploaded Content and Generated Content in accordance with
              operational requirements. All data collection and use will be in
              accordance with the Hubzz Privacy Policy.
            </p>

            <h4 className="font-semibold text-popover-foreground">
              b) Additional Terms
            </h4>
            <p>
              Any additional terms provided to You in using the Platform
              ("Additional Terms"), which may be amended from time to time, also
              govern your access and use of the Platform. If there is a conflict
              between the terms in this Agreement and the Additional Terms, the
              terms in the Additional Terms will govern.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              2. RESERVATION OF RIGHTS AND OWNERSHIP
            </h3>
            <p>
              Hubzz, its affiliates and its licensors and suppliers own the
              title, copyright, and other intellectual property rights in the
              Platform (and all rights embodied therein) and reserve all rights
              not expressly granted to You in this Agreement. The Platform is
              protected by copyright and other intellectual property laws and
              treaties.
            </p>
            <p>
              The Platform may contain third-party software that is subject to
              open source or third-party license terms ("Third-Party Terms").
              Your use of the Platform is subject to any Third-Party Terms
              included with the Platform. In the event of a conflict between
              this Agreement and any Third-Party Terms, this Agreement will
              govern.
            </p>
            <p>
              Hubzz, the Hubzz logo, and other Hubzz product and service names
              referenced in the Platform are the trademarks of Hubzz Inc. and
              its affiliates. Any other company names, product names, service
              names and logos referenced in connection with the Platform may be
              the trademarks of their respective owners.
            </p>
            <p>
              Any open source software is provided to You on an "AS IS" basis to
              the maximum extent permitted by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              3. CONDITIONS OF USE
            </h3>
            <p>
              You may not perform any act or may fall under any of the
              followings in relation to the Platform and/or Service:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>a) Illegal Activities:</strong> Any act that is illegal
                or otherwise violate applicable law, or any other act that
                violates rules that are generally observed on the internet.
              </li>
              <li>
                <strong>b) Harm to Hubzz or Others:</strong> Any act that causes
                disadvantage, inconvenience, discomfort, or damage to Hubzz or a
                third party.
              </li>
              <li>
                <strong>c) Unauthorized Redistribution:</strong> Any act that
                re-provides the Service to a third party without the permission
                of Hubzz, regardless of whether it is done for a fee or free of
                charge.
              </li>
              <li>
                <strong>d) Defamation and Human Rights Violations:</strong> Any
                act that slanders or defames Hubzz or a third party or that
                damages the honor, trust, privacy, and other moral interests of
                Hubzz or a third party, or an act that infringes upon human
                rights or endorses, invites, cooperates with, encourages, or
                incites infringement on human rights.
              </li>
              <li>
                <strong>e) Intellectual Property Infringement:</strong> Any act
                that infringes upon the Intellectual Property Rights of Hubzz or
                a third party.
              </li>
              <li>
                <strong>f) Deception and Fraud:</strong> Any act that deceives,
                misleads, defrauds, phishes, or commits or attempts to commit
                identity theft.
              </li>
              <li>
                <strong>g) Privacy Violations:</strong> Any act that violates
                any person's rights of privacy or publicity.
              </li>
              <li>
                <strong>h) Malicious Code:</strong> Any act of harming Hubzz or
                a third party such as by using viruses, spyware or malware,
                worms, trojan horses, time bombs or any other such malicious
                codes or instructions.
              </li>
              <li>
                <strong>i) Identity Theft and Impersonation:</strong> Any act of
                wrongfully using or stealing an ID or password, or an act of
                using the Service by impersonating another.
              </li>
              <li>
                <strong>j) Unauthorized Data Access:</strong> Any act of
                gathering, duplicating, altering, or deleting the information of
                a third party that can be accessed from the Service in excess of
                the manner of use anticipated by the Service.
              </li>
              <li>
                <strong>k) Spam and Unsolicited Communications:</strong> Any act
                of sending, posting, etc., message content by e-mail, etc., that
                will cause unpleasant feelings by the receiver (this includes,
                but is not limited to, spam and unsolicited email).
              </li>
              <li>
                <strong>l) Unauthorized Personal Information Use:</strong> Any
                act of wrongfully surveying, gathering, using, disclosing, or
                providing personal information or privacy information without
                the clear consent of the information's owner.
              </li>
              <li>
                <strong>m) System Interference:</strong> Any act that imposes an
                excessive burden on or interferes with the Platform's operation
                or servers.
              </li>
              <li>
                <strong>n) Reverse Engineering:</strong> Any act of
                disintegrating, disassembling, decompiling, or reverse
                engineering a program or application included in the Platform,
                or an act of deciphering a source code by any other method.
              </li>
              <li>
                <strong>o) Discrimination and Harassment:</strong> Any act of
                degrading, intimidating, inciting violence against, or
                encouraging prejudicial action against someone or a group based
                on age, gender, race, ethnicity, national origin, religion,
                sexual orientation, disability, geographic location or other
                protected category.
              </li>
              <li>
                <strong>p) Harm to Minors:</strong> Any act that exploits or
                harms children.
              </li>
              <li>
                <strong>q) Graphic Inappropriate Content:</strong> Any upload,
                download, transmit, display, or grant access to content that
                includes graphic depictions of sexuality or violence not
                appropriate for the community standards of the Platform.
              </li>
              <li>
                <strong>r) Unauthorized Data Collection:</strong> Any act of
                collecting or harvesting personally identifiable information
                without permission. This includes, but is not limited to,
                account names and email addresses.
              </li>
              <li>
                <strong>s) Improper Content Use:</strong> Any act of using the
                Platform for a purpose that differs from the Platform's purpose
                of use, or an act of using Content in excess of the manner of
                use anticipated by the Platform (including such acts as
                unauthorized duplication, redistribution, or commercial
                exploitation).
              </li>
              <li>
                <strong>t) Blockchain and NFT Violations:</strong> Any act of
                manipulating, exploiting, or fraudulently acquiring virtual
                assets, NFTs, Zones, Properties, HBC (Hubzz Credits), or XP
                (Experience Points) through unauthorized means.
              </li>
              <li>
                <strong>u) Market Manipulation:</strong> Any act of artificially
                manipulating prices, creating false scarcity, or engaging in
                wash trading or other fraudulent economic activities within the
                Platform's marketplace or economy.
              </li>
              <li>
                <strong>v) Event Disruption:</strong> Any act of disrupting,
                sabotaging, or interfering with scheduled events, performances,
                or gatherings within FlexEvent Spaces or other Platform venues.
              </li>
              <li>
                <strong>w) Zone and Property Misuse:</strong> Any act of
                violating Zone-specific rules established by Zone Owners or Zone
                Moderators, or misusing Properties, FlexEvent Spaces, or other
                virtual real estate in ways that harm the experience of other
                Users.
              </li>
              <li>
                <strong>x) Unauthorized Bot Activity:</strong> Any use of bots,
                automated scripts, or artificial intelligence to interact with
                the Platform, accumulate XP, manipulate the economy, or create
                artificial user activity without express written consent from
                Hubzz.
              </li>
              <li>
                <strong>y) Other Inappropriate Acts:</strong> Any other act that
                Hubzz deems reasonably inappropriate.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              4. ACCOUNT
            </h3>

            <h4 className="font-semibold text-popover-foreground">
              a) Account Creation
            </h4>
            <p>
              To access and use certain features of the Platform, You will be
              required to create an account ("Account"). To create an account,
              Hubzz will require You to provide certain information about
              Yourself through our authentication provider (Privy.io or
              successor services), and Hubzz may, in its sole discretion,
              require You to provide further information and/or documents at any
              stage during Your use of the Platform. Hubzz may, in its sole
              discretion, refuse, decline, suspend or disable Your access or use
              of the Platform.
            </p>

            <h4 className="font-semibold text-popover-foreground">
              b) Accurate Information Required
            </h4>
            <p>
              You must provide accurate and complete registration information
              when You create an account for the Platform. By creating an
              account, You agree to provide accurate, current and complete
              account information about Yourself, and to maintain and promptly
              update as necessary Your account information.
            </p>

            <h4 className="font-semibold text-popover-foreground">
              c) Wallet Integration
            </h4>
            <p>
              Your Account will be associated with a blockchain wallet created
              or connected through our authentication provider. This wallet will
              be used to hold NFTs representing Zones, Properties, and other
              digital assets on the Platform.
            </p>

            <h4 className="font-semibold text-popover-foreground">
              d) Account Security
            </h4>
            <p>
              You are solely responsible for the security of Your Account and
              associated wallet. You agree to undertake to maintain at all times
              adequate security and control of all of Your Account details,
              passwords, wallet seed phrases, private keys, personal
              identification numbers or any other codes that You use to access
              the Platform. You must ensure that the Account registered under
              Your name will not be used by any other person. You agree that we
              may attribute all use of Your Account to You and that You are
              responsible for all activities that occur under Your Account,
              including any purchases made using Your Account, any virtual asset
              transactions, and any interactions with other Users.
            </p>

            <h4 className="font-semibold text-popover-foreground">
              e) Account Support
            </h4>
            <p>
              In case of any breach of security, loss, theft or unauthorized use
              of Your username, password, wallet, or security information, You
              may contact Hubzz for Account support at [support contact to be
              established].
            </p>

            <h4 className="font-semibold text-popover-foreground">
              f) Account Termination
            </h4>
            <p>
              Hubzz reserves the right to terminate, suspend or restrict Your
              access to any Account(s) if there is reasonable suspicion by Hubzz
              that the person logged into Your account(s) is not You or if we
              suspect that the account(s) have been or will be used for any
              illegal, fraudulent, or unauthorized purposes. Under no
              circumstances shall Hubzz or indemnified persons in accordance
              with these Terms be responsible or liable for any direct or
              indirect losses (including loss of profits, business or
              opportunities), damages or costs suffered by You or any other
              person or entity due to any such termination, suspension or
              restriction of access to any Account(s).
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              5. USER CONTENT AND INTELLECTUAL PROPERTY
            </h3>
            <p className="text-sm italic">
              Please refer to the full text for Content Ownership, Generated
              Content, Avatar Creation, Content Standards, and Moderation
              policies.
            </p>
            {/* Abbreviated sections for brevity in this display, but keeping main headers */}
          </section>

          {/* Skipping some middle sections for file size management if needed, but per request I should try to include all content.
         I will include all content provided to be safe. */}

          <section className="space-y-4">
            <h4 className="font-semibold text-popover-foreground">
              a) Content Ownership and License Grant
            </h4>
            <p>
              You are responsible for any of Your Uploaded Content and to ensure
              that You have the ownership rights (copyright) or appropriate
              license rights to post or upload any Uploaded Content or any
              information on any portions of the Platform controlled by Hubzz.
              You agree that Uploaded Content posted or uploaded by You shall be
              accurate, lawful, and not in violation of the rights, including
              intellectual property rights, of third parties.
            </p>
            <p>
              When You submit Uploaded Content to the Platform, you continue to
              own the rights to Your Uploaded Content. However, You grant Hubzz
              a worldwide, royalty-free, perpetual, irrevocable, non-exclusive,
              transferable, and sublicensable license and right to use, copy,
              modify, adapt, prepare derivative works from, distribute, perform,
              and display that Uploaded Content and information, audio, video,
              images, or 3D models for the purpose of operating the Platform,
              providing services, marketing the Platform, and improving user
              experiences.
            </p>

            <h4 className="font-semibold text-popover-foreground">
              b) Generated Content and Platform Tools
            </h4>
            <p>
              Hubzz, its affiliates and its licensors own the title, copyright,
              interests, and other intellectual property rights of associated
              media, printed or electronic documentation, content, tools, and
              functionality, all updates and support (if any) and services in
              the Platform (and all rights embodied therein) and reserve all
              rights not expressly granted to You in this Agreement.
            </p>

            <h4 className="font-semibold text-popover-foreground">
              c) Avatar Creation and Photo Usage
            </h4>
            <p>
              The Platform provides creation of avatars using photos or other
              customization tools. You acknowledge that the avatar creation
              function on the Platform is for personal use only...
            </p>

            <h4 className="font-semibold text-popover-foreground">
              d) Content Standards
            </h4>
            <p>
              You will not upload, post, transmit, transfer, distribute or
              facilitate distribution of any Uploaded Content, or otherwise use
              the Platform in a way that:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Depicts nudity of any sort...</li>
              <li>
                Incites, advocates, or expresses pornography, obscenity,
                vulgarity...
              </li>
              <li>Misrepresents the source of anything you post...</li>
              <li>
                Provides or creates links to external sites that violate this
                Code of Conduct...
              </li>
              <li>
                Includes content that is protected by intellectual property
                laws...
              </li>
              <li>Is intended to harm or exploit minors...</li>
              <li>
                Is designed to solicit, or collect personally identifiable
                information of any minor...
              </li>
              <li>Deletes, tampers with or revises any information...</li>
              <li>Invades anyone's privacy...</li>
              <li>
                Is illegal or violates applicable local and national laws...
              </li>
              <li>Threatens, stalks, defames, defrauds...</li>
              <li>Harms or disrupts, or intends to harm or disrupt...</li>
              <li>Sends or attempts to send unsolicited messages...</li>
              <li>Attempts to impersonate a Hubzz employee...</li>
              <li>Uses any form of automated device...</li>
            </ul>

            <h4 className="font-semibold text-popover-foreground">
              e) Content Moderation and Takedown
            </h4>
            <p>
              To promote a safe and compliant Platform, Hubzz provides a process
              for submission of complaints/takedown notifications regarding
              Uploaded Content posted or uploaded by Users...
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              6. VIRTUAL ASSETS, ZONES, AND PROPERTIES
            </h3>
            <p>
              Sections regarding Virtual Real Estate Ownership, Blockchain
              Representation, Zone Builder System, POA Fees, FlexEvent Spaces,
              Zone-Specific Rules, and No Guarantee of Value.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              7. HUBZZ ECONOMY AND CURRENCY
            </h3>
            <p>
              Sections regarding Hubzz Credits (HBC), Cash-Out and Treasury Fee,
              Experience Points (XP), NFT Purchases, Zero Secondary Market Fees,
              and Economic Model Subject to Change.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              8. EVENTS AND SOCIAL FEATURES
            </h3>
            <p>
              Sections regarding Event Hosting, Attendance Tracking, Event
              Tickets/Merch, Chat/Communication, and Community Standards.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              9. GOVERNANCE AND MODERATION
            </h3>
            <p>
              Sections regarding Governance Transition, Roles and Authority,
              Scoped Moderation/Bans, Appeals/Disputes, and Zone-Level
              Governance.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              10. THIRD-PARTY RELATIONSHIPS
            </h3>
            <p>
              The Platform may contain links to, or advertisements for,
              third-party websites...
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              11. BLOCKCHAIN TECHNOLOGY AND ASSOCIATED RISKS
            </h3>
            <p>
              Sections regarding Blockchain Transactions, Gas Fees, Network
              Risks, Regulatory Uncertainty, and No Investment Advice.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              12-14. CHANGES, SUPPORT, TERMINATION
            </h3>
            <p>
              Provisions for changes to the platform, support obligations, and
              termination rights.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              15. DISCLAIMER OF WARRANTIES
            </h3>
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-xs leading-relaxed uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PLATFORM
                IS PROVIDED "AS IS," "WITH ALL FAULTS" AND "AS AVAILABLE"...
                (See full text for complete disclaimer)
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              16-17. LIABILITY LIMITATIONS AND DAMAGES
            </h3>
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-xs leading-relaxed uppercase">
                IN NO EVENT WILL HUBZZ OR ANY SUPPLIER OR LICENSOR BE LIABLE FOR
                ANY CONSEQUENTIAL; SPECIAL; INCIDENTAL; INDIRECT; PUNITIVE
                DAMAGES...
                <br />
                <br />
                HUBZZ'S AND ITS SUPPLIERS' AND LICENSORS' MAXIMUM, AGGREGATE
                LIABILITY TO YOU... WILL BE TO RECOVER THE ACTUAL DAMAGES YOU
                INCUR... UP TO ONE HUNDRED DOLLARS (U.S. $100.00)...
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              18. INDEMNIFICATION
            </h3>
            <p>You will defend, indemnify, and hold Hubzz... harmless...</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              20. GOVERNING LAW AND JURISDICTION
            </h3>
            <p>
              <strong>a) United States Users:</strong> AGREEMENT TO ARBITRATE
              DISPUTES. Please read this section carefully as it requires
              arbitration of disputes.
            </p>
            <p>
              <strong>b) International Users:</strong> Contracting with Hubzz
              Inc. under Georgia, USA law.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-popover-foreground">
              25. CONTACT INFORMATION
            </h3>
            <p>
              Hubzz Inc.
              <br />
              Attn: Legal Department
              <br />
              [Address to be established]
              <br />
              Email: [Contact email to be established]
            </p>
          </section>
        </div>

        <div className="shrink-0 border-t border-border p-6">
          <Button size="lg" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
