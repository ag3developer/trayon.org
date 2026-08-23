import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    backgroundColor: "#05070d",
    color: "#e5e7eb",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#35d0b0",
    paddingBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#35d0b0",
    marginBottom: 5,
  },
  version: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffffff",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#35d0b0",
    borderBottomWidth: 1,
    borderBottomColor: "#35d0b0",
    paddingBottom: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    color: "#a78bfa",
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  bullet: {
    marginLeft: 15,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  highlight: {
    color: "#35d0b0",
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  tableHeader: {
    backgroundColor: "#35d0b0",
    color: "#05070d",
    fontWeight: "bold",
    flex: 1,
    padding: 8,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#374151",
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#35d0b0",
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
  },
  column: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
  spacer: {
    height: 10,
  },
});

interface WhitepaperDocumentProps {
  locale?: string;
}

export const WhitepaperDocument: React.FC<WhitepaperDocumentProps> = ({
  locale = "en",
}) => {
  const content = {
    en: {
      title: "Trayon Protocol Whitepaper",
      version: "v1.0 - August 2026",
      manifesto: {
        title: "1. Manifesto",
        intro:
          "Trayon is a global data integrity infrastructure protocol designed to democratize access to trustworthy, verifiable information. We envision a world where data integrity is guaranteed across all sectors: government, judiciary, corporate accounting, and macroeconomic reporting.",
        principles: [
          "Universal Access: Information accessibility for all stakeholders",
          "Verifiability: Cryptographic proof of data authenticity",
          "Decentralization: No single point of failure or control",
          "Transparency: All validations publicly auditable",
          "Interoperability: Works across existing systems",
        ],
      },
      architecture: {
        title: "2. System Architecture",
        intro:
          "Trayon implements a distributed validator network with cryptographic consensus mechanisms.",
        components: [
          { name: "Validator Network", desc: "250,000+ nodes validating data" },
          { name: "Oracle Protocol", desc: "Multi-source data aggregation" },
          { name: "Consensus Engine", desc: "BFT-based agreement mechanism" },
          { name: "Storage Layer", desc: "Immutable audit trail" },
        ],
      },
      oracle: {
        title: "3. Oracle & Data Integration",
        intro:
          "The Trayon oracle layer connects external data sources with on-chain verification.",
        features: [
          "Real-time price feeds from 50+ exchanges",
          "Government data validation endpoints",
          "Corporate financial statement verification",
          "Macroeconomic indicator aggregation",
        ],
      },
      tokenomics: {
        title: "4. Tokenomics",
        intro: "The TRAYON token powers the validation network and incentivizes honest participation.",
        distribution: [
          { category: "Validators (40%)", amount: "400M TRAYON" },
          { category: "Team & Advisors (20%)", amount: "200M TRAYON" },
          { category: "Community Treasury (20%)", amount: "200M TRAYON" },
          { category: "Ecosystem Incentives (20%)", amount: "200M TRAYON" },
        ],
        emission:
          "Annual emission: 5% of circulating supply, declining over 10 years",
      },
      roadmap: {
        title: "5. Development Roadmap",
        phases: [
          {
            q: "Q3 2026",
            milestone: "Mainnet Launch",
            items: [
              "Full validator node deployment",
              "Initial oracle connections",
              "Community governance activation",
            ],
          },
          {
            q: "Q4 2026",
            milestone: "Enterprise Integration",
            items: [
              "Government data feeds",
              "Corporate accounting modules",
              "Institutional validator onboarding",
            ],
          },
          {
            q: "Q1 2027",
            milestone: "Global Expansion",
            items: [
              "50+ country data integrations",
              "Multi-language support",
              "Regional validator clusters",
            ],
          },
        ],
      },
      footer: "© 2026 Trayon Protocol Foundation. All rights reserved.",
    },
    pt: {
      title: "Whitepaper do Protocolo Trayon",
      version: "v1.0 - Agosto de 2026",
      manifesto: {
        title: "1. Manifesto",
        intro:
          "Trayon é um protocolo de infraestrutura global de integridade de dados projetado para democratizar o acesso a informações confiáveis e verificáveis. Envisionar um mundo onde a integridade dos dados é garantida em todos os setores: governo, judiciário, contabilidade corporativa e relatórios macroeconômicos.",
        principles: [
          "Acesso Universal: Acessibilidade de informações para todos",
          "Verificabilidade: Prova criptográfica de autenticidade",
          "Descentralização: Sem ponto único de falha",
          "Transparência: Todas as validações publicamente auditáveis",
          "Interoperabilidade: Funciona em sistemas existentes",
        ],
      },
      architecture: {
        title: "2. Arquitetura do Sistema",
        intro:
          "Trayon implementa uma rede de validadores distribuída com mecanismos de consenso criptográfico.",
        components: [
          { name: "Rede de Validadores", desc: "250.000+ nós validando dados" },
          { name: "Protocolo Oracle", desc: "Agregação de múltiplas fontes" },
          { name: "Motor de Consenso", desc: "Mecanismo de acordo baseado em BFT" },
          { name: "Camada de Armazenamento", desc: "Trilha de auditoria imutável" },
        ],
      },
      oracle: {
        title: "3. Oracle e Integração de Dados",
        intro:
          "A camada oracle de Trayon conecta fontes de dados externas com verificação on-chain.",
        features: [
          "Feeds de preços em tempo real de 50+ exchanges",
          "Endpoints de validação de dados governamentais",
          "Verificação de demonstrações financeiras corporativas",
          "Agregação de indicadores macroeconômicos",
        ],
      },
      tokenomics: {
        title: "4. Tokenomics",
        intro:
          "O token TRAYON alimenta a rede de validação e incentiva participação honesta.",
        distribution: [
          { category: "Validadores (40%)", amount: "400M TRAYON" },
          { category: "Equipe e Conselheiros (20%)", amount: "200M TRAYON" },
          { category: "Tesouro Comunitário (20%)", amount: "200M TRAYON" },
          { category: "Incentivos de Ecossistema (20%)", amount: "200M TRAYON" },
        ],
        emission:
          "Emissão anual: 5% do suprimento em circulação, diminuindo ao longo de 10 anos",
      },
      roadmap: {
        title: "5. Roadmap de Desenvolvimento",
        phases: [
          {
            q: "Q3 2026",
            milestone: "Lançamento da Mainnet",
            items: [
              "Implantação completa do nó validador",
              "Conexões iniciais de oracle",
              "Ativação de governança comunitária",
            ],
          },
          {
            q: "Q4 2026",
            milestone: "Integração Empresarial",
            items: [
              "Feeds de dados governamentais",
              "Módulos de contabilidade corporativa",
              "Integração de validadores institucionais",
            ],
          },
          {
            q: "Q1 2027",
            milestone: "Expansão Global",
            items: [
              "50+ integrações de dados de país",
              "Suporte multilíngue",
              "Clusters de validadores regionais",
            ],
          },
        ],
      },
      footer: "© 2026 Fundação do Protocolo Trayon. Todos os direitos reservados.",
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>TRAYON</Text>
          <Text style={styles.version}>{t.version}</Text>
        </View>

        <Text style={styles.title}>{t.title}</Text>

        <View style={{ marginTop: 40 }}>
          <Text style={styles.paragraph}>
            Global data integrity infrastructure for government, judiciary, corporate accounting,
            and macroeconomic reporting.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>{t.footer}</Text>
        </View>
      </Page>

      {/* Manifesto */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{t.manifesto.title}</Text>
        <Text style={styles.paragraph}>{t.manifesto.intro}</Text>

        <Text style={styles.subsectionTitle}>Core Principles</Text>
        {t.manifesto.principles.map((principle, idx) => (
          <Text key={idx} style={styles.bullet}>
            • {principle}
          </Text>
        ))}
      </Page>

      {/* Architecture */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{t.architecture.title}</Text>
        <Text style={styles.paragraph}>{t.architecture.intro}</Text>

        <Text style={styles.subsectionTitle}>Core Components</Text>
        {t.architecture.components.map((comp, idx) => (
          <View key={idx} style={styles.column}>
            <Text style={{ ...styles.bullet, color: "#35d0b0", fontWeight: "bold" }}>
              {comp.name}
            </Text>
            <Text style={{ ...styles.bullet, marginLeft: 30 }}>
              {comp.desc}
            </Text>
          </View>
        ))}
      </Page>

      {/* Oracle */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{t.oracle.title}</Text>
        <Text style={styles.paragraph}>{t.oracle.intro}</Text>

        <Text style={styles.subsectionTitle}>Data Integration Features</Text>
        {t.oracle.features.map((feature, idx) => (
          <Text key={idx} style={styles.bullet}>
            • {feature}
          </Text>
        ))}
      </Page>

      {/* Tokenomics */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{t.tokenomics.title}</Text>
        <Text style={styles.paragraph}>{t.tokenomics.intro}</Text>

        <Text style={styles.subsectionTitle}>Token Distribution</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Category</Text>
            <Text style={styles.tableHeader}>Amount</Text>
          </View>
          {t.tokenomics.distribution.map((row, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCell}>{row.category}</Text>
              <Text style={styles.tableCell}>{row.amount}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.paragraph}>
          <Text style={styles.highlight}>Emission Schedule: </Text>
          {t.tokenomics.emission}
        </Text>
      </Page>

      {/* Roadmap */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{t.roadmap.title}</Text>

        {t.roadmap.phases.map((phase, idx) => (
          <View key={idx} style={{ marginTop: 15 }}>
            <Text style={styles.subsectionTitle}>
              {phase.q} - {phase.milestone}
            </Text>
            {phase.items.map((item, itemIdx) => (
              <Text key={itemIdx} style={styles.bullet}>
                • {item}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};
