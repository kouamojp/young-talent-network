import { tr } from '@/i18n';
export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: number;
  question: string;
  options: Option[];
  category: string;
};

export type TalentArea = {
  area: string;
  score: number;
  description: string;
};

export type TestCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
};

export const testCategories: TestCategory[] = [
  { id: 'sports', name: tr('testData.sports'), icon: '⚽', description: tr('testData.testYourAthleticAptitudesAndPhysical'), color: 'from-green-500 to-emerald-600' },
  { id: 'arts', name: tr('testData.artsCreativity'), icon: '🎨', description: tr('testData.discoverYourCreativeAndArtisticTalents'), color: 'from-pink-500 to-rose-600' },
  { id: 'music', name: tr('landing.music'), icon: '🎵', description: tr('testData.evaluateYourMusicalEarAndRhythm'), color: 'from-purple-500 to-violet-600' },
  { id: 'technology', name: tr('testData.technology'), icon: '💻', description: tr('testData.assessYourTechSkillsAndLogical'), color: 'from-blue-500 to-cyan-600' },
  { id: 'business', name: tr('testData.businessLeadership'), icon: '📊', description: tr('testData.measureYourEntrepreneurialAndLeadershipSkill'), color: 'from-amber-500 to-orange-600' },
  { id: 'science', name: tr('testData.scienceResearch'), icon: '🔬', description: tr('testData.testYourAnalyticalAndScientificReasoning'), color: 'from-teal-500 to-cyan-600' },
];

export const questionsByCategory: Record<string, Question[]> = {
  sports: [
    { id: 1, category: 'sports', question: tr('testData.howDoYouReactUnderCompetitive'), options: [
      { id: "a", text: tr('testData.iThriveAndPerformBetterUnder') },
      { id: "b", text: tr('testData.iStayCalmAndMaintainMy') },
      { id: "c", text: tr('testData.iSometimesFeelAnxiousButPush') },
      { id: "d", text: tr('testData.iPreferLowPressureEnvironments') },
    ]},
    { id: 2, category: 'sports', question: tr('testData.whatTypeOfPhysicalActivityDo'), options: [
      { id: "a", text: tr('testData.teamSportsFootballBasketballVolleyball') },
      { id: "b", text: tr('testData.individualSportsSwimmingAthleticsTennis') },
      { id: "c", text: tr('testData.combatSportsBoxingJudoKarate') },
      { id: "d", text: tr('testData.artisticSportsDanceGymnasticsFigureSkating') },
    ]},
    { id: 3, category: 'sports', question: tr('testData.howImportantIsStrategyVsRaw'), options: [
      { id: "a", text: tr('testData.strategyIsEverythingIMA') },
      { id: "b", text: tr('testData.physicalAbilityMattersMostStrengthAnd') },
      { id: "c", text: tr('testData.balanceOfBothIsIdeal') },
      { id: "d", text: tr('testData.flexibilityAndCoordinationMatterMore') },
    ]},
    { id: 4, category: 'sports', question: tr('testData.howDoYouHandleTrainingRoutines'), options: [
      { id: "a", text: tr('testData.iLoveStructuredIntenseTrainingSchedules') },
      { id: "b", text: tr('testData.iPreferVariedAndFunTraining') },
      { id: "c", text: tr('testData.iTrainBestAloneWithSelf') },
      { id: "d", text: tr('testData.iNeedACoachOrGroup') },
    ]},
    { id: 5, category: 'sports', question: tr('testData.whatMotivatesYouMostInSports'), options: [
      { id: "a", text: tr('testData.winningCompetitionsAndTrophies') },
      { id: "b", text: tr('testData.personalImprovementAndBreakingRecords') },
      { id: "c", text: tr('testData.teamSpiritAndCamaraderie') },
      { id: "d", text: tr('testData.healthWellnessAndSelfExpression') },
    ]},
  ],
  arts: [
    { id: 1, category: 'arts', question: tr('testData.whenYouSeeABlankCanvas'), options: [
      { id: "a", text: tr('testData.endlessPossibilitiesIWantToPaint') },
      { id: "b", text: tr('testData.iDRatherSculptOrWork') },
      { id: "c", text: tr('testData.iThinkOfPhotographyOrDigital') },
      { id: "d", text: tr('testData.iDPreferToWriteOr') },
    ]},
    { id: 2, category: 'arts', question: tr('testData.howDoYouExpressYourEmotions'), options: [
      { id: "a", text: tr('testData.throughVisualArtDrawingPainting') },
      { id: "b", text: tr('testData.throughPerformanceActingDance') },
      { id: "c", text: tr('testData.throughWritingPoetryStories') },
      { id: "d", text: tr('testData.throughDesignFashionArchitecture') },
    ]},
    { id: 3, category: 'arts', question: tr('testData.yourApproachToCreativityIs'), options: [
      { id: "a", text: tr('testData.spontaneousIFollowInspiration') },
      { id: "b", text: tr('testData.methodicalIPlanAndSketchFirst') },
      { id: "c", text: tr('testData.collaborativeIWorkBestWithOthers') },
      { id: "d", text: tr('testData.technicalIMasterToolsAndTechniques') },
    ]},
    { id: 4, category: 'arts', question: tr('testData.whichArtisticEnvironmentAppealsToYou'), options: [
      { id: "a", text: tr('testData.aQuietStudioWithNaturalLight') },
      { id: "b", text: tr('testData.aBustlingStageOrGallery') },
      { id: "c", text: tr('testData.aDigitalWorkspaceWithScreens') },
      { id: "d", text: tr('testData.theOutdoorsAndNature') },
    ]},
    { id: 5, category: 'arts', question: tr('testData.whatDoYouValueMostIn'), options: [
      { id: "a", text: tr('testData.emotionalImpactAndStorytelling') },
      { id: "b", text: tr('testData.technicalMasteryAndSkill') },
      { id: "c", text: tr('testData.innovationAndPushingBoundaries') },
      { id: "d", text: tr('testData.culturalSignificanceAndTradition') },
    ]},
  ],
  music: [
    { id: 1, category: 'music', question: tr('testData.howDoYouRelateToMusic'), options: [
      { id: "a", text: tr('testData.iPlayOneOrMoreInstruments') },
      { id: "b", text: tr('testData.iLoveSingingAndVocalPerformance') },
      { id: "c", text: tr('testData.iMIntoProductionAndMixing') },
      { id: "d", text: tr('testData.iComposeAndWriteSongs') },
    ]},
    { id: 2, category: 'music', question: tr('testData.whatGenreSpeaksToYouMost'), options: [
      { id: "a", text: tr('testData.classicalJazzComplexHarmonies') },
      { id: "b", text: tr('testData.popRBMelodyAndVocals') },
      { id: "c", text: tr('testData.hipHopElectronicBeatsAndProduction') },
      { id: "d", text: tr('testData.rockFolkRawEmotionAndStorytelling') },
    ]},
    { id: 3, category: 'music', question: tr('testData.howDoYouLearnMusicBest'), options: [
      { id: "a", text: tr('testData.readingSheetMusicAndTheory') },
      { id: "b", text: tr('testData.byEarListeningAndReproducing') },
      { id: "c", text: tr('testData.throughDigitalToolsAndSoftware') },
      { id: "d", text: tr('testData.jammingWithOtherMusicians') },
    ]},
    { id: 4, category: 'music', question: tr('testData.yourIdealMusicCareerWouldBe'), options: [
      { id: "a", text: tr('testData.soloPerformerVirtuoso') },
      { id: "b", text: tr('testData.bandMemberOrchestraPlayer') },
      { id: "c", text: tr('testData.producerSoundEngineer') },
      { id: "d", text: tr('testData.musicTeacherMentor') },
    ]},
    { id: 5, category: 'music', question: tr('testData.whatSYourStrongestMusicalSkill'), options: [
      { id: "a", text: tr('testData.rhythmAndTiming') },
      { id: "b", text: tr('testData.melodyAndPitchRecognition') },
      { id: "c", text: tr('testData.improvisationAndCreativity') },
      { id: "d", text: tr('testData.stagePresenceAndPerformance') },
    ]},
  ],
  technology: [
    { id: 1, category: 'technology', question: tr('testData.howDoYouApproachProblemSolving'), options: [
      { id: "a", text: tr('testData.breakItDownIntoLogicalSteps') },
      { id: "b", text: tr('testData.lookForCreativeUnconventionalSolutions') },
      { id: "c", text: tr('testData.researchExistingSolutionsFirst') },
      { id: "d", text: tr('testData.prototypeQuicklyAndIterate') },
    ]},
    { id: 2, category: 'technology', question: tr('testData.whichTechAreaInterestsYouMost'), options: [
      { id: "a", text: tr('testData.softwareDevelopmentAndCoding') },
      { id: "b", text: tr('testData.aiAndMachineLearning') },
      { id: "c", text: tr('testData.cybersecurityAndNetworking') },
      { id: "d", text: tr('testData.designAndUserExperience') },
    ]},
    { id: 3, category: 'technology', question: tr('testData.howDoYouLearnNewTechnologies'), options: [
      { id: "a", text: tr('testData.onlineCoursesAndDocumentation') },
      { id: "b", text: tr('testData.buildingProjectsFromScratch') },
      { id: "c", text: tr('testData.contributingToOpenSource') },
      { id: "d", text: tr('testData.attendingWorkshopsAndHackathons') },
    ]},
    { id: 4, category: 'technology', question: tr('testData.whatMotivatesYouInTech'), options: [
      { id: "a", text: tr('testData.solvingComplexProblems') },
      { id: "b", text: tr('testData.buildingProductsPeopleUse') },
      { id: "c", text: tr('testData.pushingTechnologicalBoundaries') },
      { id: "d", text: tr('testData.makingMoneyAndCareerGrowth') },
    ]},
    { id: 5, category: 'technology', question: tr('testData.yourIdealTechRoleIs'), options: [
      { id: "a", text: tr('testData.fullStackDeveloper') },
      { id: "b", text: tr('testData.dataScientistAiEngineer') },
      { id: "c", text: tr('testData.techLeadArchitect') },
      { id: "d", text: tr('testData.productManagerDesigner') },
    ]},
  ],
  business: [
    { id: 1, category: 'business', question: tr('testData.howDoYouHandleDecisionMaking'), options: [
      { id: "a", text: tr('testData.dataDrivenIAnalyzeNumbersFirst') },
      { id: "b", text: tr('testData.intuitiveITrustMyGutFeeling') },
      { id: "c", text: tr('testData.collaborativeIConsultMyTeam') },
      { id: "d", text: tr('testData.strategicIThinkLongTermImpact') },
    ]},
    { id: 2, category: 'business', question: tr('testData.whatSYourLeadershipStyle'), options: [
      { id: "a", text: tr('testData.visionaryIInspireWithBigIdeas') },
      { id: "b", text: tr('testData.servantLeaderIEmpowerMyTeam') },
      { id: "c", text: tr('testData.resultsDrivenIFocusOnOutcomes') },
      { id: "d", text: tr('testData.adaptiveIChangeApproachAsNeeded') },
    ]},
    { id: 3, category: 'business', question: tr('testData.whichBusinessAreaExcitesYou'), options: [
      { id: "a", text: tr('testData.marketingAndBranding') },
      { id: "b", text: tr('testData.financeAndInvestment') },
      { id: "c", text: tr('testData.operationsAndManagement') },
      { id: "d", text: tr('testData.entrepreneurshipAndStartups') },
    ]},
    { id: 4, category: 'business', question: tr('testData.howDoYouHandleRisk'), options: [
      { id: "a", text: tr('testData.iTakeCalculatedRisksWithResearch') },
      { id: "b", text: tr('testData.iMANaturalRiskTaker') },
      { id: "c", text: tr('testData.iPreferSafeProvenStrategies') },
      { id: "d", text: tr('testData.iBalanceRiskAndSafety') },
    ]},
    { id: 5, category: 'business', question: tr('testData.whatSMostImportantInBusiness'), options: [
      { id: "a", text: tr('testData.innovationAndDisruption') },
      { id: "b", text: tr('testData.customerSatisfaction') },
      { id: "c", text: tr('testData.profitAndGrowth') },
      { id: "d", text: tr('testData.socialImpactAndSustainability') },
    ]},
  ],
  science: [
    { id: 1, category: 'science', question: tr('testData.whatSYourApproachToResearch'), options: [
      { id: "a", text: tr('testData.hypothesisDrivenExperimentation') },
      { id: "b", text: tr('testData.dataAnalysisAndPatternRecognition') },
      { id: "c", text: tr('testData.literatureReviewAndSynthesis') },
      { id: "d", text: tr('testData.fieldworkAndObservation') },
    ]},
    { id: 2, category: 'science', question: tr('testData.whichScientificFieldFascinatesYou'), options: [
      { id: "a", text: tr('testData.physicsAndMathematics') },
      { id: "b", text: tr('testData.biologyAndLifeSciences') },
      { id: "c", text: tr('testData.chemistryAndMaterials') },
      { id: "d", text: tr('testData.environmentalAndEarthSciences') },
    ]},
    { id: 3, category: 'science', question: tr('testData.howDoYouProcessComplexInformation'), options: [
      { id: "a", text: tr('testData.visualModelsAndDiagrams') },
      { id: "b", text: tr('testData.mathematicalFormulas') },
      { id: "c", text: tr('testData.writtenExplanations') },
      { id: "d", text: tr('testData.handsOnExperiments') },
    ]},
    { id: 4, category: 'science', question: tr('testData.whatDrivesYourCuriosity'), options: [
      { id: "a", text: tr('testData.understandingHowThingsWork') },
      { id: "b", text: tr('testData.discoveringSomethingNew') },
      { id: "c", text: tr('testData.solvingRealWorldProblems') },
      { id: "d", text: tr('testData.teachingAndSharingKnowledge') },
    ]},
    { id: 5, category: 'science', question: tr('testData.yourIdealScienceCareer'), options: [
      { id: "a", text: tr('testData.academicResearcherProfessor') },
      { id: "b", text: tr('testData.industryRDScientist') },
      { id: "c", text: tr('testData.scienceCommunicatorWriter') },
      { id: "d", text: tr('testData.medicalHealthcareProfessional') },
    ]},
  ],
};

// Keep legacy export for backward compatibility
export const questions = questionsByCategory.arts;

export const getResultsByCategory = (category: string, answers: Record<number, string>): TalentArea[] => {
  const resultMaps: Record<string, TalentArea[]> = {
    sports: [
      { area: tr('testData.teamSports'), score: 0, description: tr('testData.strongAptitudeForCollaborativeTeamBased') },
      { area: tr('testData.individualPerformance'), score: 0, description: tr('testData.excelInSoloCompetitiveDisciplines') },
      { area: tr('testData.combatMartialArts'), score: 0, description: tr('testData.naturalFitForCombatSportsAnd') },
      { area: tr('testData.artisticSports'), score: 0, description: tr('testData.talentForDanceGymnasticsAndExpressive') },
    ],
    arts: [
      { area: tr('testData.visualArts'), score: 0, description: tr('testData.strongAptitudeForPaintingDrawingAnd') },
      { area: tr('testData.performingArts'), score: 0, description: tr('testData.naturalTalentForStageActingAnd') },
      { area: tr('testData.digitalArts'), score: 0, description: tr('testData.skillsInDigitalCreationPhotographyAnd') },
      { area: tr('testData.literaryArts'), score: 0, description: tr('testData.giftForWritingStorytellingAndNarrative') },
    ],
    music: [
      { area: tr('testData.instrumentalPerformance'), score: 0, description: tr('testData.technicalMasteryOfMusicalInstruments') },
      { area: tr('testData.vocalPerformance'), score: 0, description: tr('testData.singingAbilityAndVocalControl') },
      { area: tr('testData.musicProduction'), score: 0, description: tr('testData.skillsInRecordingMixingAndSound') },
      { area: tr('testData.composition'), score: 0, description: tr('testData.talentForCreatingOriginalMusicAnd') },
    ],
    technology: [
      { area: tr('testData.softwareDevelopment'), score: 0, description: tr('testData.codingAndApplicationBuildingSkills') },
      { area: tr('testData.aiDataScience'), score: 0, description: tr('testData.machineLearningAndDataAnalysisAptitude') },
      { area: tr('testData.systemArchitecture'), score: 0, description: tr('testData.designOfComplexTechnicalSystems') },
      { area: tr('testData.uxProductDesign'), score: 0, description: tr('testData.userExperienceAndProductThinking') },
    ],
    business: [
      { area: tr('testData.marketingBrand'), score: 0, description: tr('testData.marketingStrategyAndBrandBuilding') },
      { area: tr('testData.financeInvestment'), score: 0, description: tr('testData.financialAnalysisAndInvestmentSkills') },
      { area: tr('testData.leadershipManagement'), score: 0, description: tr('testData.peopleManagementAndOrganizationalLeadership') },
      { area: tr('testData.entrepreneurship'), score: 0, description: tr('testData.startupMindsetAndBusinessCreation') },
    ],
    science: [
      { area: tr('testData.pureResearch'), score: 0, description: tr('testData.theoreticalAndExperimentalResearchAptitude') },
      { area: tr('testData.appliedScience'), score: 0, description: tr('testData.practicalApplicationOfScientificKnowledge') },
      { area: tr('testData.dataAnalysis'), score: 0, description: tr('testData.statisticalAnalysisAndPatternRecognition') },
      { area: tr('testData.scienceCommunication'), score: 0, description: tr('testData.abilityToExplainAndTeachComplex') },
    ],
  };

  const areas = resultMaps[category] || resultMaps.arts;
  
  // Generate scores based on answers
  const answerValues = Object.values(answers);
  const scoreMap: Record<string, number[]> = { a: [85, 60, 45, 70], b: [65, 80, 55, 72], c: [50, 70, 85, 60], d: [70, 55, 68, 82] };
  
  return areas.map((area, index) => {
    let totalScore = 0;
    answerValues.forEach((answer) => {
      const scores = scoreMap[answer] || [60, 60, 60, 60];
      totalScore += scores[index % 4];
    });
    const avgScore = Math.min(Math.round(totalScore / Math.max(answerValues.length, 1)), 100);
    return { ...area, score: avgScore || Math.floor(Math.random() * 30) + 55 };
  }).sort((a, b) => b.score - a.score);
};

// Legacy export
export const getTalentAreas = (): TalentArea[] => {
  return getResultsByCategory('arts', {});
};
